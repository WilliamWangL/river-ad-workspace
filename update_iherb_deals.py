#!/usr/bin/env python3
"""
Batch update iHerb (merchant_id=3193) deal descriptions and meta_descriptions.
- description: strip HTML, translate/rewrite in clean Chinese
- meta_description: SEO-optimized Chinese (~100-150 chars)
"""
import re
import mysql.connector

conn = mysql.connector.connect(
    host="127.0.0.1", user="root", password="Cbhj7+C9?1c-NPi@",
    database="river", charset="utf8mb4"
)
cur = conn.cursor(dictionary=True)

# ---------- helpers ----------
def strip_html(text: str) -> str:
    """Remove HTML tags, decode common entities, collapse whitespace."""
    if not text:
        return ""
    t = re.sub(r'<br\s*/?>', '\n', text)
    t = re.sub(r'<[^>]+>', '', t)
    t = t.replace('&#x27;', "'").replace('&amp;', '&').replace('&quot;', '"').replace('&lt;', '<').replace('&gt;', '>')
    t = re.sub(r'\n{3,}', '\n\n', t)
    t = re.sub(r'  +', ' ', t)
    return t.strip()

def extract_product_section(text: str) -> str:
    """Extract the 商品描述 / product description section."""
    if not text:
        return ""
    # Try to get text between first <p> after 商品描述 and next <h3>
    m = re.search(r'商品描述.*?<p>(.*?)</(?:h3|p)', text, re.DOTALL)
    if m:
        return strip_html(m.group(1)).strip()
    return strip_html(text)

def looks_chinese(text: str) -> bool:
    return bool(re.search(r'[\u4e00-\u9fff]{5,}', text))

def build_description(title: str, raw_desc: str) -> str:
    """Build a clean Chinese description for the product."""
    cleaned = extract_product_section(raw_desc)

    # If already mostly Chinese and decent length, just clean it up
    if looks_chinese(cleaned) and len(cleaned) > 40:
        # Remove duplicated first sentence (common iHerb pattern)
        lines = cleaned.split('\n')
        if len(lines) > 2 and lines[0][:20] == lines[1][:20]:
            cleaned = '\n'.join(lines[1:])
        return cleaned.strip()

    # Extract brand from title (before first comma or English name)
    brand = ""
    if ',' in title or '，' in title:
        brand = re.split(r'[,，]', title)[0].strip()

    # Build a Chinese description from title + key info from English desc
    # Parse English description for key selling points
    key_points = []
    if cleaned:
        sentences = re.split(r'[.\n]', cleaned)
        for s in sentences[:6]:
            s = s.strip()
            if len(s) > 15:
                key_points.append(s)

    # Construct description
    desc_parts = []
    if brand:
        desc_parts.append(f"{title}，来自 iHerb 全球健康保健品商城。")
    else:
        desc_parts.append(f"{title}，iHerb 精选好物，品质保障。")

    # Add product-specific info extracted from title
    t = title.lower()
    if any(k in t for k in ['维生素', 'vitamin', 'vitamin d', '维生素d']):
        desc_parts.append("补充日常所需维生素，助力身体健康与免疫力提升。")
    if any(k in t for k in ['肌酸', 'creatine', 'bcaa']):
        desc_parts.append("专为运动健身人群设计，有助于提升肌肉力量与运动表现。")
    if any(k in t for k in ['眼霜', 'eye cream', '面霜', 'cream', '面膜', 'mask', '唇膏', 'lipstick', 'lip', '遮瑕', 'concealer', '粉底', 'foundation', '眼影', 'eyeshadow', '眼线', 'eyeliner', '古铜', 'bronzer', '唇彩', 'lip color']):
        desc_parts.append("精选优质成分，温和呵护肌肤，打造自然精致妆容。")
    if any(k in t for k in ['洗发水', 'shampoo', '护发', 'hair', '发膜', '发油', '染发']):
        desc_parts.append("深层滋养秀发与头皮，令发丝柔顺亮泽、强韧健康。")
    if any(k in t for k in ['椰', 'coconut', '橄榄', 'olive', '醋', 'vinegar', '蔬菜', 'vegetable', '南瓜', 'pumpkin', '曲奇', 'cookie', '零食', '棒']):
        desc_parts.append("天然有机食材，健康美味，适合日常膳食与零食。")
    if any(k in t for k in ['瓜氨酸', 'citrulline', '刺五加', 'ginseng', '水飞蓟', 'milk thistle', '玛卡', 'maca', '锌', 'zinc']):
        desc_parts.append("天然植物萃取/营养补充剂，科学配方，高效吸收。")
    if any(k in t for k in ['凝胶', 'gel', '造型']):
        desc_parts.append("专业美发造型产品，持久定型，适合各种发质。")
    if any(k in t for k in ['眉毛', 'brow', '剃刀', 'razor', '刀片']):
        desc_parts.append("专业美容工具，精准修型，温和亲肤。")

    # Generic fallback if no category matched
    if len(desc_parts) == 1:
        desc_parts.append("品质保障，iHerb 全球直邮，价格优惠。")

    desc_parts.append("iHerb 全球直邮，品质保障，价格优于线下健康食品店。")

    return ''.join(desc_parts)

def build_meta_description(title: str, raw_desc: str) -> str:
    """Build SEO-optimized Chinese meta_description (~100-150 chars)."""
    brand = ""
    if ',' in title or '，' in title:
        brand = re.split(r'[,，]', title)[0].strip()

    # Categorize for keyword injection
    t = title.lower()
    category = ""
    keywords = []

    if any(k in t for k in ['维生素', 'vitamin']):
        category = "维生素保健品"
        keywords = ["营养补充", "免疫力"]
    elif any(k in t for k in ['肌酸', 'creatine', 'bcaa']):
        category = "运动营养补剂"
        keywords = ["增肌", "运动表现"]
    elif any(k in t for k in ['眼霜', 'eye cream', '面霜', 'cream', '面膜', 'mask', '洁面', 'cleanser']):
        category = "护肤品"
        keywords = ["护肤", "天然成分"]
    elif any(k in t for k in ['唇膏', 'lipstick', 'lip', '遮瑕', 'concealer', '粉底', 'foundation', '眼影', 'eyeshadow', '眼线', 'eyeliner', '古铜', 'bronzer', '唇彩', 'lip color']):
        category = "彩妆产品"
        keywords = ["美妆", "自然妆效"]
    elif any(k in t for k in ['洗发水', 'shampoo', '护发', 'hair', '发膜', '发油', '染发', '凝胶', 'gel', '造型']):
        category = "护发美发产品"
        keywords = ["滋养秀发", "头皮护理"]
    elif any(k in t for k in ['椰', 'coconut', '橄榄', 'olive', '醋', 'vinegar', '蔬菜', 'vegetable', '南瓜', 'pumpkin', '曲奇', 'cookie', '零食', '棒']):
        category = "健康食品"
        keywords = ["有机", "天然美味"]
    elif any(k in t for k in ['瓜氨酸', 'citrulline', '刺五加', 'ginseng', '水飞蓟', 'milk thistle', '玛卡', 'maca', '锌', 'zinc']):
        category = "营养保健品"
        keywords = ["草本萃取", "健康调理"]
    elif any(k in t for k in ['眉毛', 'brow', '剃刀', 'razor', '刀片']):
        category = "美容工具"
        keywords = ["精准修型", "专业品质"]
    else:
        category = "健康好物"
        keywords = ["品质保障"]

    meta = f"iHerb{title}，{category}美国直邮。"
    if keywords:
        meta += f"{'、'.join(keywords)}，"
    meta += "正品保障，价格优惠，全球配送。上 iHerb 海淘更多健康好物，享折扣价与包邮优惠。"

    # Trim to ~150 chars
    if len(meta) > 160:
        meta = meta[:155] + "。"
    return meta

# ---------- main ----------
cur.execute("""
    SELECT id, title, description
    FROM river_coupon_deal
    WHERE merchant_id = 3193 AND deleted = 0
    ORDER BY id
""")
rows = cur.fetchall()
print(f"Found {len(rows)} deals to process.\n")

updates = []
for row in rows:
    did = row['id']
    title = row['title']
    raw_desc = row['description'] or ""

    new_desc = build_description(title, raw_desc)
    new_meta = build_meta_description(title, raw_desc)

    updates.append((new_desc, new_meta, did))
    print(f"[{did}] {title}")
    print(f"  desc: {new_desc[:80]}...")
    print(f"  meta: {new_meta}")
    print()

# Batch update
print(f"\nUpdating {len(updates)} records...")
for new_desc, new_meta, did in updates:
    cur.execute("""
        UPDATE river_coupon_deal
        SET description = %s, meta_description = %s
        WHERE id = %s
    """, (new_desc, new_meta, did))

conn.commit()
print(f"Done! {len(updates)} deals updated.")

# Verify
cur.execute("""
    SELECT id, title, LEFT(meta_description, 60) AS meta_preview
    FROM river_coupon_deal
    WHERE merchant_id = 3193 AND deleted = 0 AND meta_description IS NOT NULL
    ORDER BY id
""")
verified = cur.fetchall()
print(f"\nVerification: {len(verified)} deals now have meta_description.")

cur.close()
conn.close()
