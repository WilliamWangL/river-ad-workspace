#!/usr/bin/env python3
"""
ali_products.xml (YML Catalog, AliExpress Admitad feed) -> river_coupon_deal
流式解析 1.4GB XML 并批量插入 deal 表。

映射约定（对齐现有 walmart 导入数据的格式）：
  merchant_id  = 3109 (AliExpress WW, network_id=1 Admitad)
  external_id  = aliexpress-{offerId}
  slug         = aliexpress-deal-3109-{offerId}
  goto_url     = feed 的 url 字段（联盟深链，原样使用）
  regions      = merchant 3109 的 regions（与商家地区一致）
  status       = 0 (ENABLE), tenant_id = 1

用法：
  RIVER_DB_PASSWORD=xxx python3 import_ali_products_to_deals.py --limit 2000   # 测试前 2000 条
  RIVER_DB_PASSWORD=xxx python3 import_ali_products_to_deals.py                # 全量
环境变量：RIVER_DB_HOST/PORT/USER/PASSWORD/NAME，ALI_XML_PATH
"""
import argparse
import json
import os
import re
import sys
import time
import xml.etree.ElementTree as ET

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
MERCHANT_ID = 3109
NETWORK_ID = 1
TENANT_ID = 1
BATCH_SIZE = 2000

INSERT_SQL = (
    "INSERT IGNORE INTO river_coupon_deal "
    "(merchant_id, network_id, external_id, title, slug, description, "
    "original_price, deal_price, discount_percent, image_url, image_urls, "
    "goto_url, regions, category_ids, status, tenant_id, "
    "hot_score, featured, exclusive, creator, updater) "
    "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
)

DISCOUNT_RE = re.compile(r"(\d+)")


def load_merchant_regions(conn):
    with conn.cursor() as cur:
        cur.execute(
            "SELECT regions FROM river_affiliate_merchant WHERE id = %s",
            (MERCHANT_ID,),
        )
        row = cur.fetchone()
        return (row[0] or "").strip() if row else None


def to_float(text):
    if not text:
        return None
    try:
        return round(float(text.strip()), 2)
    except ValueError:
        return None


def parse_offer(elem):
    """从 <offer> 元素提取一行数据；无效数据返回 None"""
    offer_id = (elem.get("id") or "").strip()
    name = (elem.findtext("name") or "").strip()
    url = (elem.findtext("url") or "").strip()
    deal_price = to_float(elem.findtext("price"))
    if not offer_id or not name or not url or deal_price is None:
        return None

    original_price = to_float(elem.findtext("oldprice"))

    pictures, seen = [], set()
    for pic in elem.iter("picture"):
        p = (pic.text or "").strip()
        if p and p not in seen:
            seen.add(p)
            pictures.append(p)

    params = {p.get("name"): (p.text or "").strip() for p in elem.iter("param")}
    discount = None
    m = DISCOUNT_RE.match(params.get("discount", ""))
    if m:
        discount = min(int(m.group(1)), 100)

    title = name[:300]
    return (
        MERCHANT_ID,
        NETWORK_ID,
        f"aliexpress-{offer_id}",
        title,
        f"aliexpress-deal-{MERCHANT_ID}-{offer_id}"[:300],
        title,  # description 回填标题，保证详情页有内容
        original_price,
        deal_price,
        discount,
        pictures[0][:500] if pictures else None,
        json.dumps(pictures, ensure_ascii=False) if pictures else None,
        url[:1000],
        REGIONS,
        None,  # category_ids: feed 类目是 AliExpress 自有体系，不映射平台类目
        0,  # status = ENABLE
        TENANT_ID,
        0,  # hot_score
        0,  # featured
        0,  # exclusive
        "1",  # creator
        "1",  # updater
    )


REGIONS = None


def main():
    global REGIONS
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0, help="只处理前 N 条 offer（测试用）")
    args = parser.parse_args()

    conn = pymysql.connect(**DB_CONFIG)
    REGIONS = load_merchant_regions(conn)
    print(f"merchant {MERCHANT_ID} regions: {REGIONS[:80]}...")

    started = time.time()
    batch, inserted, skipped, processed = [], 0, 0, 0

    context = ET.iterparse(XML_PATH, events=("end",))
    try:
        for _, elem in context:
            if elem.tag != "offer":
                continue
            processed += 1
            row = parse_offer(elem)
            if row is None:
                skipped += 1
            else:
                batch.append(row)

            # 释放已处理元素，控制内存
            elem.clear()

            if len(batch) >= BATCH_SIZE:
                with conn.cursor() as cur:
                    cur.executemany(INSERT_SQL, batch)
                conn.commit()
                inserted += cur.rowcount
                batch = []

            if processed % 50000 == 0:
                rate = processed / max(time.time() - started, 1e-6)
                print(f"processed={processed} skipped={skipped} rate={rate:.0f}/s elapsed={time.time()-started:.0f}s", flush=True)

            if args.limit and processed >= args.limit:
                break
    except ET.ParseError as e:
        # feed 下载截断时视为文件结束，已解析的完整 offer 均有效
        print(f"WARNING: XML 在中途截断（{e}），按文件结束处理", flush=True)

    if batch:
        with conn.cursor() as cur:
            cur.executemany(INSERT_SQL, batch)
        conn.commit()
        inserted += cur.rowcount

    conn.close()
    print(f"DONE processed={processed} inserted={inserted} skipped={skipped} elapsed={time.time()-started:.0f}s")


if __name__ == "__main__":
    main()
