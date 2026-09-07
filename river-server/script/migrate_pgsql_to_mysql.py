#!/usr/bin/env python3
"""
River 广告平台：PostgreSQL -> MySQL 8.0 业务数据迁移脚本

用法：
  export PG_HOST=localhost PG_PORT=5432 PG_DB=river PG_USER=postgres PG_PASSWORD=123456
  export MYSQL_HOST=localhost MYSQL_PORT=3306 MYSQL_DB=river MYSQL_USER=root MYSQL_PASSWORD=123456
  python3 migrate_pgsql_to_mysql.py

前置依赖：
  pip install psycopg2-binary pymysql

说明：
  1. 假设 MySQL 目标库已按 sql/mysql/ 下脚本初始化好表结构。
  2. 脚本会清空目标表（TRUNCATE），然后按块从 PostgreSQL 读取并写入 MySQL。
  3. 写入完成后重置自增 ID（AUTO_INCREMENT）为当前最大值 + 1。
  4. 最后输出源库与目标库各表的行数对比。
"""
import os
import sys
from typing import List, Tuple, Dict, Any

import psycopg2
import pymysql

# 每次读取/写入的块大小
CHUNK_SIZE = 1000


def get_env_or_default(key: str, default: str = None) -> str:
    return os.environ.get(key, default)


def connect_pg():
    return psycopg2.connect(
        host=get_env_or_default("PG_HOST", "localhost"),
        port=int(get_env_or_default("PG_PORT", "5432")),
        database=get_env_or_default("PG_DB", "river"),
        user=get_env_or_default("PG_USER", "postgres"),
        password=get_env_or_default("PG_PASSWORD", "123456"),
    )


def connect_mysql():
    return pymysql.connect(
        host=get_env_or_default("MYSQL_HOST", "localhost"),
        port=int(get_env_or_default("MYSQL_PORT", "3306")),
        database=get_env_or_default("MYSQL_DB", "river"),
        user=get_env_or_default("MYSQL_USER", "root"),
        password=get_env_or_default("MYSQL_PASSWORD", "123456"),
        charset="utf8mb4",
        autocommit=False,
    )


def get_tables(pg_cur) -> List[str]:
    """获取 PostgreSQL public _schema 下所有业务表（排除系统/视图）。"""
    pg_cur.execute("""
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename NOT LIKE 'pg_%'
          AND tablename NOT LIKE 'sql_%'
        ORDER BY tablename
    """)
    return [row[0] for row in pg_cur.fetchall()]


def get_mysql_columns(mysql_cur, table: str) -> Dict[str, str]:
    """获取 MySQL 目标表的列名 -> 数据类型小写。"""
    mysql_cur.execute("""
        SELECT COLUMN_NAME, DATA_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = %s
    """, (table,))
    return {row[0].lower(): row[1].lower() for row in mysql_cur.fetchall()}


def get_pg_columns(pg_cur, table: str) -> List[str]:
    """获取 PostgreSQL 表的列名列表。"""
    pg_cur.execute("""
        SELECT column_name FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = %s
        ORDER BY ordinal_position
    """, (table,))
    return [row[0] for row in pg_cur.fetchall()]


def convert_value(value: Any, mysql_type: str) -> Any:
    """根据 MySQL 列类型对从 PostgreSQL 读取的值做必要转换。"""
    if value is None:
        return None

    # PostgreSQL bool -> MySQL TINYINT(1) / BIT(1)
    if isinstance(value, bool):
        if mysql_type == "bit":
            return b"\x01" if value else b"\x00"
        return 1 if value else 0

    # PostgreSQL 的 dict/list（JSON/JSONB）在 PyMySQL 中需要转成 JSON 字符串
    if isinstance(value, (dict, list)):
        import json
        return json.dumps(value, ensure_ascii=False)

    return value


def migrate_table(pg_cur, mysql_cur, table: str, mysql_cols: Dict[str, str]) -> Tuple[int, int]:
    """迁移单表数据，返回 (源库行数, 目标库写入行数)。"""
    pg_columns = get_pg_columns(pg_cur, table)
    if not pg_columns:
        print(f"  [跳过] 源库表 {table} 无列信息")
        return 0, 0

    # 仅迁移两端都存在的列
    common_cols = [c for c in pg_columns if c.lower() in mysql_cols]
    if not common_cols:
        print(f"  [跳过] 表 {table} 无公共列")
        return 0, 0

    cols_sql = ", ".join(f"`{c}`" for c in common_cols)
    placeholders = ", ".join(["%s"] * len(common_cols))
    insert_sql = f"INSERT INTO `{table}` ({cols_sql}) VALUES ({placeholders})"

    # 清空目标表
    mysql_cur.execute(f"TRUNCATE TABLE `{table}`")

    # 统计源表行数
    pg_cur.execute(f"SELECT COUNT(*) FROM \"{table}\"")
    source_count = pg_cur.fetchone()[0]

    if source_count == 0:
        print(f"  表 {table}: 源库 0 行，无需迁移")
        return 0, 0

    # 按块读取并写入
    pg_cur.execute(f"SELECT {', '.join(common_cols)} FROM \"{table}\"")
    inserted = 0
    while True:
        rows = pg_cur.fetchmany(CHUNK_SIZE)
        if not rows:
            break
        converted = []
        for row in rows:
            new_row = []
            for col, val in zip(common_cols, row):
                new_row.append(convert_value(val, mysql_cols.get(col.lower(), "")))
            converted.append(tuple(new_row))
        mysql_cur.executemany(insert_sql, converted)
        inserted += len(converted)
        print(f"  表 {table}: {inserted}/{source_count} 行已写入", end="\r")

    print(f"  表 {table}: 写入 {inserted} 行（源库 {source_count} 行）")
    return source_count, inserted


def reset_auto_increment(mysql_cur, table: str):
    """对有 id 列的表重置 AUTO_INCREMENT。"""
    mysql_cur.execute("""
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = %s
          AND COLUMN_NAME = 'id' AND EXTRA LIKE '%%auto_increment%%'
    """, (table,))
    if not mysql_cur.fetchone():
        return

    mysql_cur.execute(f"SELECT COALESCE(MAX(`id`), 0) + 1 FROM `{table}`")
    next_id = mysql_cur.fetchone()[0]
    if next_id and next_id > 1:
        mysql_cur.execute(f"ALTER TABLE `{table}` AUTO_INCREMENT = %s", (next_id,))
        print(f"    重置 {table}.AUTO_INCREMENT = {next_id}")


def validate_counts(pg_cur, mysql_cur, tables: List[str]) -> Dict[str, Tuple[int, int]]:
    """校验源库与目标库各表行数，返回差异表。"""
    diffs = {}
    for table in tables:
        pg_cur.execute(f"SELECT COUNT(*) FROM \"{table}\"")
        pg_count = pg_cur.fetchone()[0]
        try:
            mysql_cur.execute(f"SELECT COUNT(*) FROM `{table}`")
            mysql_count = mysql_cur.fetchone()[0]
        except Exception as e:
            mysql_count = -1
            print(f"  [警告] 统计 {table} 目标库行数失败: {e}")
        if pg_count != mysql_count:
            diffs[table] = (pg_count, mysql_count)
    return diffs


def main():
    print("=" * 60)
    print("River PostgreSQL -> MySQL 8.0 数据迁移")
    print("=" * 60)

    pg_conn = connect_pg()
    mysql_conn = connect_mysql()

    pg_cur = pg_conn.cursor()
    mysql_cur = mysql_conn.cursor()

    # 关闭外键检查，避免导入顺序问题
    mysql_cur.execute("SET FOREIGN_KEY_CHECKS = 0")

    tables = get_tables(pg_cur)
    print(f"发现 {len(tables)} 个待迁移表")
    print("-" * 60)

    total_source = 0
    total_inserted = 0

    try:
        for table in tables:
            mysql_cols = get_mysql_columns(mysql_cur, table)
            if not mysql_cols:
                print(f"  [跳过] 目标库不存在表 {table}")
                continue

            source_count, inserted = migrate_table(pg_cur, mysql_cur, table, mysql_cols)
            total_source += source_count
            total_inserted += inserted

            # 重置自增 ID
            reset_auto_increment(mysql_cur, table)

            mysql_conn.commit()

    except Exception as e:
        mysql_conn.rollback()
        print(f"\n[错误] 迁移过程中断: {e}")
        raise
    finally:
        mysql_cur.execute("SET FOREIGN_KEY_CHECKS = 1")

    print("-" * 60)
    print(f"总计：源库 {total_source} 行，目标库写入 {total_inserted} 行")

    print("\n正在校验行数...")
    diffs = validate_counts(pg_cur, mysql_cur, tables)
    if diffs:
        print("[失败] 以下表行数不一致：")
        for table, (pg_count, mysql_count) in diffs.items():
            print(f"  {table}: PostgreSQL={pg_count}, MySQL={mysql_count}")
        sys.exit(1)
    else:
        print("[成功] 所有表行数校验通过")

    pg_cur.close()
    mysql_cur.close()
    pg_conn.close()
    mysql_conn.close()


if __name__ == "__main__":
    main()
