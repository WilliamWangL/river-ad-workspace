#!/usr/bin/env python3
"""
将 PostgreSQL (river-postgres 容器) 中的业务/框架数据导出为 MySQL INSERT 脚本。

用法：
  python3 export_pgsql_to_mysql_sql.py

输出：
  river-server/sql/mysql/migration/data/<table_name>.sql

说明：
  - 使用 docker exec + psql 读取 PostgreSQL 数据，无需本地安装 psql 或 psycopg2。
  - 自动跳过 MySQL 目标库不存在的表、Quartz 表、以及 PostgreSQL 系统表。
  - 生成的脚本已处理布尔值、NULL、字符串转义，并包含 SET FOREIGN_KEY_CHECKS = 0。
"""
import csv
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

# PostgreSQL 连接（通过 Docker 容器）
PG_CONTAINER = "river-postgres"
PG_USER = "postgres"
PG_DB = "river"

# MySQL 目标连接（宿主机）。若未配置或连接失败，则按 PostgreSQL 源表结构生成脚本。
MYSQL_HOST = os.environ.get("MYSQL_HOST", "localhost")
MYSQL_PORT = os.environ.get("MYSQL_PORT", "3306")
MYSQL_USER = os.environ.get("MYSQL_USER", "root")
MYSQL_PASSWORD = os.environ.get("MYSQL_PASSWORD", "")
MYSQL_DB = os.environ.get("MYSQL_DB", "river")

# 输出目录
ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = ROOT / "sql" / "mysql" / "migration" / "data"

# 跳过的表
SKIP_TABLES = {"dual"}
SKIP_PREFIXES = ("qrtz_",)


def run_pg_csv(sql: str) -> str:
    """在 river-postgres 容器中执行 COPY ... TO STDOUT (CSV, NULL='\\N')，返回 CSV 文本。"""
    copy_sql = f"COPY ({sql}) TO STDOUT WITH (FORMAT csv, NULL '\\N', HEADER true)"
    cmd = [
        "docker", "exec", PG_CONTAINER,
        "psql", "-U", PG_USER, "-d", PG_DB,
        "-c", copy_sql,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
    if result.returncode != 0:
        raise RuntimeError(f"psql failed: {result.stderr}")
    return result.stdout


def run_mysql(query: str) -> str:
    """使用本地 mysql 客户端执行查询。"""
    cmd = [
        "mysql", "-h", MYSQL_HOST, "-P", MYSQL_PORT,
        "-u", MYSQL_USER, f"-p{MYSQL_PASSWORD}",
        "-N", "-B", "-e", query, MYSQL_DB,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
    if result.returncode != 0:
        raise RuntimeError(f"mysql failed: {result.stderr}")
    return result.stdout


def list_pg_tables() -> list[str]:
    """列出 PostgreSQL public schema 下需要迁移的表（跳过分区子表）。"""
    sql = """
        SELECT t.tablename FROM pg_tables t
        WHERE t.schemaname = 'public'
          AND t.tablename NOT LIKE 'pg_%'
          AND t.tablename NOT LIKE 'sql_%'
          AND NOT EXISTS (
              SELECT 1 FROM pg_inherits i
              JOIN pg_class c ON i.inhrelid = c.oid
              WHERE c.relname = t.tablename
          )
        ORDER BY t.tablename
    """
    text = run_pg_csv(sql)
    rows = list(csv.reader(text.splitlines()))
    if not rows:
        return []
    tables = []
    for row in rows[1:]:  # skip header
        if not row:
            continue
        name = row[0]
        if name in SKIP_TABLES or any(name.startswith(p) for p in SKIP_PREFIXES):
            continue
        tables.append(name)
    return tables


def mysql_table_exists(table: str) -> bool:
    try:
        out = run_mysql(
            f"SELECT 1 FROM INFORMATION_SCHEMA.TABLES "
            f"WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '{table}'"
        )
        return bool(out.strip())
    except RuntimeError:
        return False


def mysql_columns(table: str) -> list[str]:
    """获取 MySQL 目标表的列名（按顺序）。"""
    out = run_mysql(
        f"SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS "
        f"WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '{table}' "
        f"ORDER BY ORDINAL_POSITION"
    )
    return [line.strip() for line in out.splitlines() if line.strip()]


def pg_columns(table: str) -> list[str]:
    """获取 PostgreSQL 表的列名（按顺序）。"""
    sql = f"""
        SELECT column_name FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = '{table}'
        ORDER BY ordinal_position
    """
    text = run_pg_csv(sql)
    rows = list(csv.reader(text.splitlines()))
    if not rows:
        return []
    return [row[0] for row in rows[1:] if row]


def mysql_escape(value) -> str:
    """将 Python 值转换为 MySQL INSERT 可用的字面量。"""
    # psql --null '\\N' 明确标识 NULL；空字符串保持为空字符串
    if value is None or value == "\\N":
        return "NULL"
    if value == "":
        return "''"

    # PostgreSQL CSV 中布尔值会以多种字符串形式出现
    if isinstance(value, str):
        lowered = value.lower()
        if lowered in ("true", "t", "yes", "y", "1"):
            return "1"
        if lowered in ("false", "f", "no", "n", "0"):
            return "0"

    if isinstance(value, (int, float)):
        return str(value)

    # 字符串：单引号转义为 ''，反斜杠与控制字符转义
    s = str(value)
    s = s.replace("\\", "\\\\")  # 先处理反斜杠
    s = s.replace("'", "''")
    s = s.replace("\n", "\\n")
    s = s.replace("\r", "\\r")
    s = s.replace("\t", "\\t")
    return f"'{s}'"


# MySQL 是否可连接（首次检测后缓存）
_mysql_available = None


def is_mysql_available() -> bool:
    global _mysql_available
    if _mysql_available is not None:
        return _mysql_available
    try:
        run_mysql("SELECT 1")
        _mysql_available = True
    except RuntimeError:
        _mysql_available = False
    return _mysql_available


def export_table(table: str) -> int:
    """导出单表为 MySQL INSERT 脚本，返回导出行数。"""
    pg_cols = pg_columns(table)
    if not pg_cols:
        print(f"  [跳过] 源表 {table} 无列信息")
        return 0

    # 优先按 MySQL 目标表结构过滤公共列；若无法连接 MySQL，则使用 PostgreSQL 源表全部列
    if is_mysql_available():
        if not mysql_table_exists(table):
            print(f"  [跳过] MySQL 中不存在表 {table}")
            return 0
        my_cols = mysql_columns(table)
        common_cols = [c for c in pg_cols if c in my_cols]
    else:
        common_cols = pg_cols

    if not common_cols:
        print(f"  [跳过] 表 {table} 无公共列")
        return 0

    col_sql = ", ".join(f"`{c}`" for c in common_cols)

    # 导出 CSV
    select_cols = ", ".join(f'"{c}"' for c in common_cols)
    sql = f'SELECT {select_cols} FROM "{table}"'
    text = run_pg_csv(sql)
    reader = csv.reader(text.splitlines())
    header = next(reader, None)
    if header is None:
        return 0

    output_file = OUTPUT_DIR / f"{table}.sql"
    rows_written = 0

    with output_file.open("w", encoding="utf-8") as f:
        f.write("SET NAMES utf8mb4;\n")
        f.write("SET FOREIGN_KEY_CHECKS = 0;\n\n")

        batch = []
        for row in reader:
            if not row:
                continue
            values = ", ".join(mysql_escape(v) for v in row)
            batch.append(f"({values})")
            if len(batch) >= 500:
                f.write(f"INSERT INTO `{table}` ({col_sql}) VALUES\n")
                f.write(",\n".join(batch))
                f.write(";\n\n")
                rows_written += len(batch)
                batch = []

        if batch:
            f.write(f"INSERT INTO `{table}` ({col_sql}) VALUES\n")
            f.write(",\n".join(batch))
            f.write(";\n\n")
            rows_written += len(batch)

    if rows_written == 0:
        output_file.unlink(missing_ok=True)
        print(f"  表 {table}: 0 行")
        return 0

    print(f"  表 {table}: {rows_written} 行 -> {output_file.relative_to(ROOT)}")
    return rows_written


def main():
    print("=" * 60)
    print("PostgreSQL -> MySQL INSERT 脚本导出")
    print("=" * 60)

    # 清空并创建输出目录
    if OUTPUT_DIR.exists():
        shutil.rmtree(OUTPUT_DIR)
    OUTPUT_DIR.mkdir(parents=True)

    tables = list_pg_tables()
    print(f"发现 {len(tables)} 个待处理表")
    print("-" * 60)

    total = 0
    for table in tables:
        try:
            total += export_table(table)
        except Exception as e:
            print(f"  [错误] 导出 {table} 失败: {e}")

    print("-" * 60)
    print(f"总计导出 {total} 行数据，输出目录: {OUTPUT_DIR.relative_to(ROOT)}")

    # 生成汇总加载脚本
    load_script = OUTPUT_DIR / "_load_all.sql"
    with load_script.open("w", encoding="utf-8") as f:
        f.write("SET NAMES utf8mb4;\n")
        f.write("SET FOREIGN_KEY_CHECKS = 0;\n\n")
        for table in tables:
            file_path = OUTPUT_DIR / f"{table}.sql"
            if file_path.exists():
                f.write(f"SOURCE {file_path}\n")
        f.write("\nSET FOREIGN_KEY_CHECKS = 1;\n")
    print(f"汇总脚本: {load_script.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
