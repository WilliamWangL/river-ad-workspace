#!/usr/bin/env python3
"""
主流 deal 站分类体系重构（参照 Slickdeals / hotukdeals / RetailMeNot 标准结构）。

现状三套体系混杂（俄语 59 + 旧英文 31 + feed 18，顶级 90+ 无序），
重构为 14 顶级 + 子分类的英文主流体系，region=00，保持「顶级+子级双标签」。

步骤（--step）：
  backup    影子表备份（category / deal.category_ids / coupon.category_ids）
  structure 恢复 214、新建 Events & Holidays / Gaming、重命名/重挂/slug/icon/sort
  junction  关联表重映射（feed deal 补顶级标签、旧类合并、RU 类迁移）
  recount   重算 deal.category_ids 字符串（与 junction 对齐，admin 保存幂等）
  coupons   重写 coupon.category_ids 引用（216→267 / 221→271 / 202→Gaming / 265→278）
  cleanup   软删除退役分类（RU 全部 + 合并冗余）
  verify    统计验证

用法：
  RIVER_DB_PASSWORD=xxx python3 reorg_categories.py --step backup
  RIVER_DB_PASSWORD=xxx python3 reorg_categories.py --step structure
  ...
"""
import argparse
import os
import sys
import time

import pymysql

DB_CONFIG = dict(
    host=os.environ.get("RIVER_DB_HOST", "127.0.0.1"),
    port=int(os.environ.get("RIVER_DB_PORT", "3306")),
    user=os.environ.get("RIVER_DB_USER", "root"),
    password=os.environ.get("RIVER_DB_PASSWORD", ""),
    database=os.environ.get("RIVER_DB_NAME", "river"),
    charset="utf8mb4",
    autocommit=False,
)
TENANT_ID = 1
STAMP = "20261014"

# ============================================================
# 目标分类体系：顶级（复用现有 id，保持 junction/coupon 引用稳定）
#   (id, name, slug, parent, level, icon, sort)
# ============================================================
TOP_LEVELS = {
    215: ("Electronics",              "electronics",       "Laptop",          10),
    267: ("Home & Garden",            "home-garden",       "Home",            20),
    219: ("Fashion & Apparel",        "fashion-apparel",   "Shirt",           30),
    266: ("Tools & Home Improvement", "tools",             "Tag",             40),
    271: ("Auto & Parts",             "auto-parts",        "Tag",             50),
    264: ("Health & Beauty",          "health-beauty",     "Sparkles",        60),
    234: ("Toys, Kids & Baby",        "toys-kids-baby",    "Baby",            70),
    222: ("Sports & Outdoors",        "sports-outdoors",   "Dumbbell",        80),
    220: ("Travel",                   "travel",            "Heart",           90),
    214: ("Marketplaces",             "marketplaces",      "Tag",             95),  # 恢复软删
    230: ("Grocery",                  "grocery",            "ShoppingBasket", 100),
    229: ("Gifts & Flowers",          "gifts-flowers",     "Tag",             110),
    225: ("Services",                 "services",          "Tag",             120),
}
NEW_TOPS = [("Events & Holidays", "events", "Tag", 900)]

# ============================================================
# 子分类：(id, name, slug, parent, level, icon, sort)
# ============================================================
SUBS = {
    # Electronics(215)
    270: ("Cell Phones & Accessories", "cell-phones-accessories", 215, "Tag", 10),
    # Home & Garden(267)
    268: ("Furniture",                 "furniture",                267, "Tag", 10),
    283: ("Home Decor",                "home-decor",               267, "Tag", 20),
    278: ("Kitchen & Dining",          "kitchen-dining",           267, "Tag", 30),
    276: ("Home Storage & Organization", "home-storage-organization", 267, "Tag", 40),
    272: ("Garden Supplies",           "garden-supplies",           267, "Tag", 50),
    # Fashion & Apparel(219)
    269: ("Men's Clothing",            "mens-clothing",             219, "Tag", 10),
    218: ("Shoes",                     "shoes",                     219, "Tag", 20),
    217: ("Accessories & Bags",        "accessories-bags",         219, "Tag", 30),
    224: ("Watches & Jewelry",         "watches-jewelry",          219, "Tag", 40),
    # Tools & Home Improvement(266)
    273: ("Tool Parts",                "tool-parts",                266, "Tag", 10),
    275: ("Measurement & Analysis Instruments", "measurement-analysis-instruments", 266, "Tag", 20),
    228: ("DIY & Garden",              "diy-garden",                266, "Tag", 30),
    # Auto & Parts(271)
    280: ("Exterior Parts",            "exterior-parts",            271, "Tag", 10),
    279: ("Interior Accessories",      "interior-accessories",      271, "Tag", 20),
    # Health & Beauty(264)
    226: ("Personal Care & Pharmacy",  "personal-care-pharmacy",    264, "Tag", 10),
    190: ("Health & Wellness",         "health-wellness",           264, "Tag", 20),
    # Toys, Kids & Baby(234)
    233: ("Games & Toys",              "games-toys",                234, "Tag", 10),
    # Grocery(230)
    227: ("Pet Supplies",              "pet-supplies",              230, "Tag", 10),
    # Services(225)
    231: ("Books",                     "books",                     225, "Tag", 10),
    235: ("Online Education",          "online-education",          225, "Tag", 20),
    232: ("Finance & Insurance",       "finance-insurance",         225, "Tag", 30),
}
NEW_SUBS = [
    # (name, slug, parent_id, icon, sort)：Gaming 挂 Electronics(215)（承接 RU 202 Онлайн-игры）
    ("Gaming", "gaming", 215, "Tag", 20),
]
# 事件类统一挂 Events & Holidays（新建顶级）
EVENTS = {
    223: ("Cyber Monday 2026", "cyber-monday-2026", 10),
    248: ("Sale 11.11", "sale-11-11", 20),
    236: ("Ramadan 2024", "ramadan-2024", 30),
    262: ("Back to School 2026", "back-to-school-2026", 40),
    247: ("Heroes Marathon 2026", "heroes-marathon-2026", 50),
    241: ("Green Vibes Fest UA", "green-vibes-fest-ua", 60),
    251: ("Pack & Earn Travel Marathon 2026", "pack-earn-travel-marathon-2026", 70),
    252: ("June AI Fest", "june-ai-fest", 80),
}

# ============================================================
# junction 操作一：feed deal 补新顶级标签（源标签保留，源分类只是降级为子分类）
#   from_cat -> to_cat（仅新增顶级关联，不动源关联）
# ============================================================
TOP_TAG_ADD = {
    269: 219,  # Men's Clothing deal 补 Fashion & Apparel 顶级
    270: 215,  # Cell Phones deal 补 Electronics 顶级
    268: 267,  # Furniture deal 补 Home & Garden 顶级
}
# junction 操作二：旧类替换（新增目标关联 + 退役源关联，源分类随后软删除）
#   from_cat -> to_cat
JUNCTION_REMAP = {
    216: 267,  # 旧 Home & Furniture -> Home & Garden
    221: 271,  # 旧 Auto & Moto Goods -> Auto & Parts
    181: 229,  # RU Подарки и цветы -> Gifts & Flowers
    265: 278,  # 旧 Kitchen & Bath -> Kitchen & Dining
    # 202 -> gaming_id 在运行时按 slug 查询补充
}
# 合并后退役的子分类（deal 已有父类标签，junction 直接软删）
MERGE_AWAY = [274, 282, 277, 281]
# coupon category_ids 的 id 映射（其余 id 全部保持不变）
COUPON_ID_MAP = {216: 267, 221: 271, 265: 278}  # 202 -> gaming_id 运行时补充

DEAL_BATCH = 5000


def q(conn, sql, args=None):
    with conn.cursor() as cur:
        cur.execute(sql, args or ())
        return cur.fetchall()


def run(conn, sql, args=None, label=""):
    with conn.cursor() as cur:
        cur.execute(sql, args or ())
        affected = cur.rowcount
    conn.commit()
    if label:
        print(f"  [{label}] affected={affected}")
    return affected


def slug_to_id(conn):
    rows = q(conn, "SELECT id, slug FROM river_affiliate_category WHERE deleted=0 AND tenant_id=%s", (TENANT_ID,))
    return {s: i for i, s in rows}


def id_to_slug(conn):
    rows = q(conn, "SELECT id, slug FROM river_affiliate_category WHERE deleted=0 AND tenant_id=%s", (TENANT_ID,))
    return dict(rows)


# ------------------------------------------------------------
def step_backup(conn):
    for table, cols in [
        ("river_affiliate_category", "*"),
        ("river_coupon_deal", "id, category_ids"),
        ("river_coupon_coupon", "id, category_ids"),
    ]:
        bak = f"river_bak_{table.split('_', 2)[2]}_{STAMP}"
        run(conn, f"DROP TABLE IF EXISTS {bak}")
        run(conn, f"CREATE TABLE {bak} AS SELECT {cols} FROM {table}", label=f"backup {bak}")
    print("backup 完成")


def step_structure(conn, dry):
    slugs = slug_to_id(conn)

    def update_cat(cid, name, slug, parent, level, icon, sort):
        if dry:
            print(f"  UPDATE cat {cid}: name={name!r} slug={slug} parent={parent} level={level} icon={icon} sort={sort}")
            return
        run(conn,
            "UPDATE river_affiliate_category SET name=%s, slug=%s, parent_id=%s, level=%s, icon=%s, sort=%s, "
            "updater='1' WHERE id=%s AND tenant_id=%s",
            (name, slug, parent, level, icon, sort, cid, TENANT_ID), label=f"cat {cid}")

    def insert_cat(name, slug, parent, level, icon, sort):
        if dry:
            print(f"  INSERT cat: name={name!r} slug={slug} parent={parent} level={level}")
            return None
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO river_affiliate_category "
                "(parent_id, name, slug, level, sort, icon, region, status, creator, updater, tenant_id) "
                "VALUES (%s,%s,%s,%s,%s,%s,'00',0,'1','1',%s)",
                (parent, name, slug, level, sort, icon, TENANT_ID))
            cid = cur.lastrowid
        conn.commit()
        print(f"  INSERT cat: {name!r} -> id={cid}")
        return cid

    # 1. 恢复 214 Marketplaces（232 条 coupon 引用中）
    if dry:
        print("  REVIVE cat 214 (Marketplaces)")
    else:
        run(conn, "UPDATE river_affiliate_category SET deleted=0, updater='1' WHERE id=214", label="revive 214")

    # 2. 新建顶级 Events & Holidays
    ename, eslug, eicon, esort = NEW_TOPS[0]
    events_id = insert_cat(ename, eslug, 0, 1, eicon, esort) if not dry else None
    if not dry and events_id:
        slugs["events"] = events_id

    # 3. 新建子分类 Gaming（挂 Electronics 215，承接 RU 202 Онлайн-игры 的引用）
    name, slug, parent_id, icon, sort = NEW_SUBS[0]
    gaming_id = insert_cat(name, slug, parent_id, 2, icon, sort) if not dry else None

    # 4. 顶级元数据
    for cid, (name, slug, icon, sort) in TOP_LEVELS.items():
        update_cat(cid, name, slug, 0, 1, icon, sort)

    # 5. 子分类元数据
    for cid, (name, slug, parent, icon, sort) in SUBS.items():
        update_cat(cid, name, slug, parent, 2, icon, sort)

    # 6. 事件子分类
    if not dry:
        eid = slugs.get("events") or events_id
    else:
        eid = "<events_id>"
    for cid, (name, slug, sort) in EVENTS.items():
        update_cat(cid, name, slug, eid, 2, "Tag", sort)

    if dry:
        print("（dry-run，未写库）")
        return None, None
    return events_id, gaming_id


def step_junction(conn, dry):
    gaming = q(conn, "SELECT id FROM river_affiliate_category WHERE slug='gaming' AND deleted=0 AND tenant_id=%s",
               (TENANT_ID,))
    if not gaming:
        sys.exit("ERROR: 未找到 Gaming 分类（slug=gaming），请先执行 structure 步骤")
    gaming_id = gaming[0][0]
    print(f"  Gaming 分类 id={gaming_id}")

    def add_tags(src, dst, retire_src, dry):
        """给打了 src 标签的 deal 补 dst 标签；retire_src=True 时退役 src 关联"""
        if dry:
            print(f"  {'REPLACE' if retire_src else 'ADD-TOP'} {src} -> {dst} (dry)")
            return
        # 目标标签补插（INSERT IGNORE，uk 冲突自动跳过）
        run(conn,
            f"INSERT IGNORE INTO river_coupon_deal_category (deal_id, category_id, creator, updater, tenant_id) "
            f"SELECT deal_id, {dst}, '1', '1', {TENANT_ID} FROM river_coupon_deal_category "
            f"WHERE category_id = {src} AND deleted = 0", label=f"{src}->{dst} insert")
        # 曾被软删的同键行复活（INSERT IGNORE 被跳过的场景）
        run(conn,
            f"UPDATE river_coupon_deal_category j JOIN (SELECT DISTINCT deal_id FROM river_coupon_deal_category "
            f"WHERE category_id = {src} AND deleted = 0) t ON j.deal_id = t.deal_id "
            f"SET j.deleted = 0, j.update_time = NOW() WHERE j.category_id = {dst} AND j.deleted = 1",
            label=f"{src}->{dst} revive")
        # 源标签软删除（保留审计痕迹，可恢复）
        if retire_src:
            run(conn,
                f"UPDATE river_coupon_deal_category SET deleted = 1, update_time = NOW() "
                f"WHERE category_id = {src} AND deleted = 0", label=f"{src}->{dst} retire-src")

    # 操作一：feed deal 补新顶级标签（源子分类关联保留）
    for src, dst in sorted(TOP_TAG_ADD.items()):
        add_tags(src, dst, retire_src=False, dry=dry)

    # 操作二：旧类替换（新增目标关联 + 退役源关联）
    remap = dict(JUNCTION_REMAP)
    remap[202] = gaming_id
    for src, dst in sorted(remap.items()):
        add_tags(src, dst, retire_src=True, dry=dry)

    # 操作三：合并退役的子分类 junction（deal 已有父类标签）
    for cid in MERGE_AWAY:
        if dry:
            print(f"  MERGE-AWAY {cid} (dry)")
            continue
        run(conn,
            f"UPDATE river_coupon_deal_category SET deleted = 1, update_time = NOW() "
            f"WHERE category_id = {cid} AND deleted = 0", label=f"merge-away {cid}")


def step_recount(conn, dry):
    """deal.category_ids 与 junction 活跃行对齐（分批，避免 795k 单事务）"""
    total = q(conn, "SELECT COUNT(*) FROM river_coupon_deal WHERE deleted=0 AND tenant_id=%s", (TENANT_ID,))[0][0]
    print(f"  待重算 deal：{total}")
    if dry:
        return
    done = 0
    t0 = time.time()
    last_id = 0
    while True:
        rows = q(conn,
                 "SELECT d.id FROM river_coupon_deal d WHERE d.deleted=0 AND d.tenant_id=%s AND d.id > %s "
                 "ORDER BY d.id LIMIT %s", (TENANT_ID, last_id, DEAL_BATCH))
        if not rows:
            break
        ids = [r[0] for r in rows]
        last_id = ids[-1]
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE river_coupon_deal d JOIN ("
                "  SELECT j.deal_id, GROUP_CONCAT(j.category_id ORDER BY j.category_id) ids"
                "  FROM river_coupon_deal_category j WHERE j.deleted = 0 AND j.deal_id IN (%s)"
                "  GROUP BY j.deal_id"
                ") t ON d.id = t.deal_id "
                "SET d.category_ids = IFNULL(t.ids, ''), d.updater = '1' "
                "WHERE d.id IN (%s)" % (",".join(map(str, ids)), ",".join(map(str, ids))))
            cur.execute(
                "UPDATE river_coupon_deal d SET d.category_ids = '' WHERE d.id IN (%s) "
                "AND NOT EXISTS (SELECT 1 FROM river_coupon_deal_category j WHERE j.deal_id = d.id AND j.deleted = 0)"
                % ",".join(map(str, ids)))
        conn.commit()
        done += len(ids)
        if done % (DEAL_BATCH * 20) == 0 or done >= total:
            print(f"  recount {done}/{total} rate={done / max(time.time() - t0, 1e-6):.0f}/s", flush=True)
        if len(ids) < DEAL_BATCH:
            break


def step_coupons(conn, dry):
    gaming = q(conn, "SELECT id FROM river_affiliate_category WHERE slug='gaming' AND deleted=0 AND tenant_id=%s",
               (TENANT_ID,))
    if not gaming:
        sys.exit("ERROR: 未找到 Gaming 分类（slug=gaming），请先执行 structure 步骤")
    cmap = dict(COUPON_ID_MAP)
    cmap[202] = gaming[0][0]
    rows = q(conn,
             "SELECT id, category_ids FROM river_coupon_coupon "
             "WHERE deleted=0 AND category_ids IS NOT NULL AND category_ids != ''")
    updated = 0
    for cid, cat_str in rows:
        ids = [x.strip() for x in cat_str.split(",") if x.strip()]
        mapped = []
        for x in ids:
            if not x.isdigit():
                continue
            v = cmap.get(int(x), int(x))
            if v not in mapped:
                mapped.append(v)
        new_str = ",".join(map(str, sorted(mapped)))
        if new_str == cat_str:
            continue
        if dry:
            print(f"  coupon {cid}: {cat_str} -> {new_str}")
        else:
            run(conn, "UPDATE river_coupon_coupon SET category_ids=%s, updater='1' WHERE id=%s",
                (new_str, cid), label=None)
        updated += 1
    print(f"  coupon 重写 {updated} 条")


def step_cleanup(conn, dry):
    # RU 全部 + 旧英文合并冗余
    ru_ids = [r[0] for r in q(conn, "SELECT id FROM river_affiliate_category WHERE region='RU' AND deleted=0")]
    retired = sorted(set(ru_ids) | set(MERGE_AWAY) | {216, 221, 265})
    print(f"  软删除分类 {len(retired)} 个：RU {len(ru_ids)} + 合并冗余 {[x for x in retired if x not in ru_ids]}")
    if dry:
        return
    for cid in retired:
        run(conn, "UPDATE river_affiliate_category SET deleted=1, updater='1' WHERE id=%s AND deleted=0",
            (cid,), label=f"retire cat {cid}")


def step_verify(conn):
    print("\n=== 新体系顶级分类（含 deal/coupon 引用）===")
    rows = q(conn, """
        SELECT c.id, c.name, c.slug, c.icon, c.sort,
          (SELECT COUNT(DISTINCT j.deal_id) FROM river_coupon_deal_category j
            WHERE j.category_id = c.id AND j.deleted = 0) AS deals,
          (SELECT COUNT(*) FROM river_coupon_coupon cp
            WHERE cp.deleted = 0 AND FIND_IN_SET(c.id, cp.category_ids)) AS coupons
        FROM river_affiliate_category c
        WHERE c.deleted = 0 AND c.parent_id = 0 AND c.tenant_id = %s
        ORDER BY c.sort, c.id""", (TENANT_ID,))
    for r in rows:
        print(f"  [{r[4]:>3}] #{r[0]:<4} {r[1]:<28} slug={r[2]:<32} icon={r[3]:<8} deals={r[5]:<7} coupons={r[6]}")

    print("\n=== 子分类 ===")
    rows = q(conn, """
        SELECT p.name, c.id, c.name, c.slug, c.sort,
          (SELECT COUNT(DISTINCT j.deal_id) FROM river_coupon_deal_category j
            WHERE j.category_id = c.id AND j.deleted = 0) AS deals
        FROM river_affiliate_category c
        JOIN river_affiliate_category p ON p.id = c.parent_id
        WHERE c.deleted = 0 AND c.parent_id != 0 AND c.tenant_id = %s
        ORDER BY p.sort, c.sort, c.id""", (TENANT_ID,))
    for r in rows:
        print(f"    {r[0]:<26} -> #{r[1]:<4} {r[2]:<34} deals={r[5]}")

    print("\n=== 残留检查（引用已删分类的行，应为 0）===")
    bad = q(conn, """
        SELECT COUNT(*) FROM river_coupon_deal_category j
        JOIN river_affiliate_category c ON c.id = j.category_id
        WHERE j.deleted = 0 AND c.deleted = 1""")
    print(f"  junction 引用已删分类：{bad[0][0]}")
    bad_c = q(conn, """
        SELECT COUNT(*) FROM river_coupon_coupon cp
        JOIN river_affiliate_category c ON FIND_IN_SET(c.id, cp.category_ids)
        WHERE cp.deleted = 0 AND c.deleted = 1""")
    print(f"  coupon 引用已删分类：{bad_c[0][0]}")

    print("\n=== deal.category_ids 与 junction 一致性（应为 0）===")
    diff = q(conn, """
        SELECT COUNT(*) FROM river_coupon_deal d
        LEFT JOIN (SELECT deal_id, GROUP_CONCAT(category_id ORDER BY category_id) ids
                   FROM river_coupon_deal_category WHERE deleted = 0 GROUP BY deal_id) t
          ON t.deal_id = d.id
        WHERE d.deleted = 0 AND d.tenant_id = %s
          AND d.category_ids != IFNULL(t.ids, '')""", (TENANT_ID,))
    print(f"  不一致 deal 数：{diff[0][0]}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--step", required=True,
                    choices=["backup", "structure", "junction", "recount", "coupons", "cleanup", "verify"])
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    dry = args.dry_run

    conn = pymysql.connect(**DB_CONFIG)

    if args.step == "backup":
        step_backup(conn)
    elif args.step == "structure":
        ids = step_structure(conn, dry)
        if not dry and ids[1]:
            print(f"\n新建分类 id：Events & Holidays={ids[0]}, Gaming={ids[1]}（已自动建好，后续步骤按 slug 引用）")
    elif args.step == "junction":
        step_junction(conn, dry)
    elif args.step == "recount":
        step_recount(conn, dry)
    elif args.step == "coupons":
        step_coupons(conn, dry)
    elif args.step == "cleanup":
        step_cleanup(conn, dry)
    elif args.step == "verify":
        step_verify(conn)
    conn.close()


if __name__ == "__main__":
    main()
