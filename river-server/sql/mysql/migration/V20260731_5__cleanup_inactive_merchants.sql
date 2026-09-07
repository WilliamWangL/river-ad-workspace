-- 清理没有合作关系的 Admitad 商家及其关联数据
-- 判断依据：如果商家的所有 offer 的 goto_url 都不含 'https://ad.admitad.com/'
-- 说明 deeplink 生成失败（合作关系无效），使用软删除（deleted=1）

-- ============================================================
-- Step 1: 软删除无效商家的 Offer
-- ============================================================
UPDATE river_affiliate_offer
SET deleted = 1, update_time = NOW()
WHERE deleted = 0
  AND network_id IS NOT NULL
  AND merchant_id IN (
    SELECT m.id FROM river_affiliate_merchant m
    WHERE m.deleted = 0
      AND m.network_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM river_affiliate_offer o2
        WHERE o2.merchant_id = m.id
          AND o2.deleted = 0
          AND o2.goto_url LIKE 'https://ad.admitad.com/%'
      )
  );

-- ============================================================
-- Step 2: 软删除无效商家（没有任何 Admitad deeplink offer 的商家）
-- ============================================================
UPDATE river_affiliate_merchant
SET deleted = 1, update_time = NOW()
WHERE deleted = 0
  AND network_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM river_affiliate_offer o
    WHERE o.merchant_id = river_affiliate_merchant.id
      AND o.deleted = 0
      AND o.goto_url LIKE 'https://ad.admitad.com/%'
  );

-- ============================================================
-- Step 3: 软删除这些商家的优惠券
-- ============================================================
UPDATE river_coupon_coupon
SET deleted = 1, update_time = NOW()
WHERE deleted = 0
  AND merchant_id IN (
    SELECT id FROM river_affiliate_merchant WHERE deleted = 1
  );

-- ============================================================
-- Step 4: 软删除这些商家的 Deal
-- ============================================================
UPDATE river_coupon_deal
SET deleted = 1, update_time = NOW()
WHERE deleted = 0
  AND merchant_id IN (
    SELECT id FROM river_affiliate_merchant WHERE deleted = 1
  );

-- ============================================================
-- 验证：查看被清理的数据量
-- ============================================================
SELECT 'soft-deleted merchants' AS item, COUNT(*) AS cnt
FROM river_affiliate_merchant WHERE deleted = 1
UNION ALL
SELECT 'soft-deleted offers', COUNT(*)
FROM river_affiliate_offer WHERE deleted = 1
UNION ALL
SELECT 'soft-deleted coupons', COUNT(*)
FROM river_coupon_coupon WHERE deleted = 1
UNION ALL
SELECT 'soft-deleted deals', COUNT(*)
FROM river_coupon_deal WHERE deleted = 1;
