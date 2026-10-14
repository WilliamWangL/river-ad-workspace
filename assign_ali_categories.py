#!/usr/bin/env python3
"""
为已导入的 AliExpress deal 自动分配分类：
1. 解析 ali_products.xml 类目定义与 offer 引用
2. 在 river_affiliate_category 创建实际用到的顶级分类 + 子分类
3. 批量更新 river_coupon_deal.category_ids 并写入 river_coupon_deal_category 关联表

每条 deal 打「顶级 + 子级」双标签：按顶级筛选可见全量，按子分类筛选精确匹配。

用法：
  RIVER_DB_PASSWORD=xxx python3 assign_ali_categories.py --dry-run  # 仅统计
  RIVER_DB_PASSWORD=xxx python3 assign_ali_categories.py            # 执行
"""
import argparse
import os
import re
import time
import xml.etree.ElementTree as ET
from collections import Counter

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

XML_PATH = os.environ.get("ALI_XML_PATH", "/root/workspace/river-ad-workspace/ali_products.xml")
TENANT_ID = 1
BATCH_SIZE = 2000


def unescape(s):
    return (s.replace("&amp;", "&").replace("&#39;", "'")
             .replace("&quot;", '"').replace("&lt;", "<").replace("&gt;", ">"))


def slugify(name, feed_id):
    s = re.sub(r"[^a-z0-9\s-]", "", name.lower()).strip()
    s = re.sub(r"[\s-]+", "-", s).strip("-")
    return s[:80] or f"ali-category-{feed_id}"


def parse_feed():
    """解析类目定义 + offer 引用，返回 (cats, used_by_offer, offers)"""
    cats = {}
    offers = []
    used = Counter()
    in_offers = False
    # iterparse 流式：categories 元素小，offer 只取 id/categoryId
    try:
        for _, elem in ET.iterparse(XML_PATH, events=("end",)):
            if elem.tag == "category":
                cid = elem.get("id")
                if cid:
                    cats[cid] = (elem.get("parentId"), unescape(elem.text or "").strip())
                elem.clear()
            elif elem.tag == "offer":
                oid = (elem.get("id") or "").strip()
                cat = (elem.findtext("categoryId") or "").strip()
                if oid and cat:
                    offers.append((oid, cat))
                    used[cat] += 1
                elem.clear()
            elif elem.tag in ("shop", "offers", "yml_catalog"):
                elem.clear()
    except ET.ParseError as e:
        # feed 下载截断时视为文件结束，已解析的完整元素均有效
        print(f"WARNING: XML 在中途截断（{e}），按文件结束处理", flush=True)
    return cats, used, offers


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="仅统计不写库")
    args = parser.parse_args()

    started = time.time()
    print("解析 feed ...", flush=True)
    cats, used, offers = parse_feed()
    print(f"类目定义 {len(cats)} 个，offer {len(offers)} 条，引用类目 {len(used)} 个，"
          f"耗时 {time.time()-started:.0f}s", flush=True)

    # 仅处理实际被引用的类目链（顶级 + 子级）
    needed_top = {}
    needed_sub = {}
    for cid in used:
        pid, name = cats.get(cid, (None, None))
        if pid is None:
            needed_top[cid] = name
        else:
            needed_sub[cid] = (name, pid)
            # 子类的父若也是子类，向上取根（本 feed 全两层，直接保险处理）
            root = pid
            while cats.get(root, (None,))[0] is not None:
                root = cats[root][0]
            needed_top.setdefault(root, cats[root][1])
    print(f"需创建顶级 {len(needed_top)} 个: {sorted(needed_top.values())}")
    print(f"需创建子分类 {len(needed_sub)} 个: {sorted(n for n, _ in needed_sub.values())}")

    if args.dry_run:
        for cid, n in used.most_common():
            pid, name = cats.get(cid, ('?', '?'))
            print(f"  {name} (feed id {cid}, parent {pid}): {n} offers")
        return

    conn = pymysql.connect(**DB_CONFIG)

    # 1. 创建平台分类（按 slug 幂等）
    with conn.cursor() as cur:
        cur.execute(
            "SELECT id, slug, name FROM river_affiliate_category "
            "WHERE deleted = 0 AND tenant_id = %s", (TENANT_ID,))
        existing_slug = {r[1]: r[0] for r in cur.fetchall()}

    platform_id = {}  # feed_cat_id -> platform_category_id

    def create_category(name, slug, parent_id, level):
        if slug in existing_slug:
            cid = existing_slug[slug]
            print(f"  复用现有分类: {name} (id={cid}, slug={slug})")
            return cid
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO river_affiliate_category "
                "(parent_id, name, slug, level, sort, region, status, creator, updater, tenant_id) "
                "VALUES (%s,%s,%s,%s,0,'00',0,'1','1',%s)",
                (parent_id, name, slug, level, TENANT_ID))
            cid = cur.lastrowid
        existing_slug[slug] = cid
        return cid

    print("\n创建顶级分类:")
    for feed_id, name in sorted(needed_top.items()):
        slug = slugify(name, feed_id)
        platform_id[feed_id] = create_category(name, slug, 0, 1)

    print("创建子分类:")
    for feed_id, (name, pid) in sorted(needed_sub.items()):
        slug = slugify(name, feed_id)
        if slug in existing_slug and existing_slug[slug] in platform_id.values():
            # 同名子分类已建（重跑场景）
            platform_id[feed_id] = existing_slug[slug]
            print(f"  复用现有子分类: {name} (id={existing_slug[slug]})")
            continue
        # slug 冲突但指向其他分类时追加后缀
        if slug in existing_slug:
            slug = f"{slug}-{feed_id}"
        platform_id[feed_id] = create_category(name, slug, platform_id[pid], 2)

    conn.commit()
    print(f"分类就绪: {len(platform_id)} 个平台分类 ID 映射")

    # 2. 拉取 deal external_id -> id 映射
    print("\n加载 deal 映射 ...", flush=True)
    with conn.cursor() as cur:
        cur.execute(
            "SELECT id, external_id FROM river_coupon_deal "
            "WHERE external_id LIKE 'aliexpress-%%' AND deleted = 0")
        deal_map = {r[1]: r[0] for r in cur.fetchall()}
    print(f"deal 映射 {len(deal_map)} 条")

    # 3. 组装写入数据：category_ids = "顶级ID,子ID"，junction 两行
    updates = []   # (category_ids, deal_id)
    links = []     # (deal_id, category_id)
    for oid, feed_cat in offers:
        deal_id = deal_map.get(f"aliexpress-{oid}")
        if deal_id is None:
            continue
        pid, _ = cats.get(feed_cat, (None, None))
        if pid is None:
            # offer 直接挂顶级类目
            if feed_cat in platform_id:
                updates.append((str(platform_id[feed_cat]), deal_id))
                links.append((deal_id, platform_id[feed_cat]))
        else:
            root = pid
            while cats.get(root, (None,))[0] is not None:
                root = cats[root][0]
            if feed_cat in platform_id and root in platform_id:
                updates.append((f"{platform_id[root]},{platform_id[feed_cat]}", deal_id))
                links.append((deal_id, platform_id[root]))
                links.append((deal_id, platform_id[feed_cat]))

    print(f"待更新 deal {len(updates)} 条，junction 关联 {len(links)} 行")

    # 4. 批量写库
    t0 = time.time()
    for i in range(0, len(updates), BATCH_SIZE):
        batch = updates[i:i + BATCH_SIZE]
        with conn.cursor() as cur:
            cur.executemany(
                "UPDATE river_coupon_deal SET category_ids = %s WHERE id = %s", batch)
        conn.commit()
        if (i // BATCH_SIZE) % 50 == 0:
            rate = (i + len(batch)) / max(time.time() - t0, 1e-6)
            print(f"  deal 更新 {i + len(batch)}/{len(updates)} rate={rate:.0f}/s", flush=True)

    t0 = time.time()
    for i in range(0, len(links), BATCH_SIZE):
        batch = links[i:i + BATCH_SIZE]
        with conn.cursor() as cur:
            cur.executemany(
                "INSERT IGNORE INTO river_coupon_deal_category "
                "(deal_id, category_id, creator, updater, tenant_id) "
                "VALUES (%s,%s,'1','1',%s)",
                [(d, c, TENANT_ID) for d, c in batch])
        conn.commit()
        if (i // BATCH_SIZE) % 100 == 0:
            rate = (i + len(batch)) / max(time.time() - t0, 1e-6)
            print(f"  junction 插入 {i + len(batch)}/{len(links)} rate={rate:.0f}/s", flush=True)

    conn.close()
    print(f"DONE 总耗时 {time.time()-started:.0f}s")


if __name__ == "__main__":
    main()
