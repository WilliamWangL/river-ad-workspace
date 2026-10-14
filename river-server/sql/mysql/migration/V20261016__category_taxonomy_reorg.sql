-- =====================================================================
-- 分类体系重构：按主流 deal 站标准（Slickdeals/hotukdeals/RetailMeNot）
-- 整合三套混杂体系（俄语 61 + 旧英文 31 + feed 18）为 14 顶级 + 32 子分类
--
-- 原则：
--   1. 顶级复用现有分类 id（junction/coupon 引用保持稳定）
--   2. 保持「顶级 + 子级」双标签：分类页按精确 categoryId 查询、不级联
--   3. 全部软删除（deleted=1），可回滚；回滚前有影子表备份
--      river_bak_category_20261014 / river_bak_deal_20261014 / river_bak_coupon_20261014
--
-- 本文件在本地库已执行（reorg_categories.py --step ... 逐步执行），
-- 此处为等效记录，供其他环境参考执行。
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. 恢复被误删的 Marketplaces（232 条 coupon 引用中）
-- ---------------------------------------------------------------------
UPDATE river_affiliate_category SET deleted = 0, updater = '1' WHERE id = 214;

-- ---------------------------------------------------------------------
-- 2. 新建顶级 Events & Holidays 与子分类 Gaming（挂 Electronics 215）
-- ---------------------------------------------------------------------
INSERT INTO river_affiliate_category
    (parent_id, name, slug, level, sort, icon, region, status, creator, updater, tenant_id)
VALUES (0, 'Events & Holidays', 'events', 1, 900, 'Tag', '00', 0, '1', '1', 1);
SET @events_id = LAST_INSERT_ID();

INSERT INTO river_affiliate_category
    (parent_id, name, slug, level, sort, icon, region, status, creator, updater, tenant_id)
VALUES (215, 'Gaming', 'gaming', 2, 20, 'Tag', '00', 0, '1', '1', 1);
SET @gaming_id = LAST_INSERT_ID();

-- ---------------------------------------------------------------------
-- 3. 顶级分类元数据（name/slug/parent/level/icon/sort）
--    icon 对应 river-ecommica iconMap：Laptop/Home/Shirt/Sparkles/Baby/
--    Dumbbell/ShoppingBasket/Heart，其余用 Tag 兜底
-- ---------------------------------------------------------------------
UPDATE river_affiliate_category SET name='Electronics',              slug='electronics',    parent_id=0, level=1, icon='Laptop',          sort=10,  updater='1' WHERE id=215;
UPDATE river_affiliate_category SET name='Home & Garden',            slug='home-garden',   parent_id=0, level=1, icon='Home',            sort=20,  updater='1' WHERE id=267;
UPDATE river_affiliate_category SET name='Fashion & Apparel',        slug='fashion-apparel',parent_id=0, level=1, icon='Shirt',           sort=30,  updater='1' WHERE id=219;
UPDATE river_affiliate_category SET name='Tools & Home Improvement', slug='tools',         parent_id=0, level=1, icon='Tag',             sort=40,  updater='1' WHERE id=266;
UPDATE river_affiliate_category SET name='Auto & Parts',             slug='auto-parts',    parent_id=0, level=1, icon='Tag',             sort=50,  updater='1' WHERE id=271;
UPDATE river_affiliate_category SET name='Health & Beauty',          slug='health-beauty', parent_id=0, level=1, icon='Sparkles',        sort=60,  updater='1' WHERE id=264;
UPDATE river_affiliate_category SET name='Toys, Kids & Baby',       slug='toys-kids-baby',parent_id=0, level=1, icon='Baby',            sort=70,  updater='1' WHERE id=234;
UPDATE river_affiliate_category SET name='Sports & Outdoors',        slug='sports-outdoors',parent_id=0, level=1, icon='Dumbbell',        sort=80,  updater='1' WHERE id=222;
UPDATE river_affiliate_category SET name='Travel',                  slug='travel',        parent_id=0, level=1, icon='Heart',           sort=90,  updater='1' WHERE id=220;
UPDATE river_affiliate_category SET name='Marketplaces',             slug='marketplaces',  parent_id=0, level=1, icon='Tag',             sort=95,  updater='1' WHERE id=214;
UPDATE river_affiliate_category SET name='Grocery',                  slug='grocery',       parent_id=0, level=1, icon='ShoppingBasket', sort=100, updater='1' WHERE id=230;
UPDATE river_affiliate_category SET name='Gifts & Flowers',         slug='gifts-flowers', parent_id=0, level=1, icon='Tag',             sort=110, updater='1' WHERE id=229;
UPDATE river_affiliate_category SET name='Services',                 slug='services',      parent_id=0, level=1, icon='Tag',             sort=120, updater='1' WHERE id=225;

-- ---------------------------------------------------------------------
-- 4. 子分类元数据（重挂主流体系下）
-- ---------------------------------------------------------------------
UPDATE river_affiliate_category SET name='Cell Phones & Accessories', slug='cell-phones-accessories', parent_id=215, level=2, icon='Tag', sort=10, updater='1' WHERE id=270;
UPDATE river_affiliate_category SET name='Furniture',                 slug='furniture',               parent_id=267, level=2, icon='Tag', sort=10, updater='1' WHERE id=268;
UPDATE river_affiliate_category SET name='Home Decor',                slug='home-decor',              parent_id=267, level=2, icon='Tag', sort=20, updater='1' WHERE id=283;
UPDATE river_affiliate_category SET name='Kitchen & Dining',          slug='kitchen-dining',          parent_id=267, level=2, icon='Tag', sort=30, updater='1' WHERE id=278;
UPDATE river_affiliate_category SET name='Home Storage & Organization', slug='home-storage-organization', parent_id=267, level=2, icon='Tag', sort=40, updater='1' WHERE id=276;
UPDATE river_affiliate_category SET name='Garden Supplies',           slug='garden-supplies',         parent_id=267, level=2, icon='Tag', sort=50, updater='1' WHERE id=272;
UPDATE river_affiliate_category SET name='Men''s Clothing',           slug='mens-clothing',           parent_id=219, level=2, icon='Tag', sort=10, updater='1' WHERE id=269;
UPDATE river_affiliate_category SET name='Shoes',                     slug='shoes',                   parent_id=219, level=2, icon='Tag', sort=20, updater='1' WHERE id=218;
UPDATE river_affiliate_category SET name='Accessories & Bags',        slug='accessories-bags',        parent_id=219, level=2, icon='Tag', sort=30, updater='1' WHERE id=217;
UPDATE river_affiliate_category SET name='Watches & Jewelry',         slug='watches-jewelry',         parent_id=219, level=2, icon='Tag', sort=40, updater='1' WHERE id=224;
UPDATE river_affiliate_category SET name='Tool Parts',                slug='tool-parts',              parent_id=266, level=2, icon='Tag', sort=10, updater='1' WHERE id=273;
UPDATE river_affiliate_category SET name='Measurement & Analysis Instruments', slug='measurement-analysis-instruments', parent_id=266, level=2, icon='Tag', sort=20, updater='1' WHERE id=275;
UPDATE river_affiliate_category SET name='DIY & Garden',              slug='diy-garden',              parent_id=266, level=2, icon='Tag', sort=30, updater='1' WHERE id=228;
UPDATE river_affiliate_category SET name='Exterior Parts',            slug='exterior-parts',          parent_id=271, level=2, icon='Tag', sort=10, updater='1' WHERE id=280;
UPDATE river_affiliate_category SET name='Interior Accessories',      slug='interior-accessories',    parent_id=271, level=2, icon='Tag', sort=20, updater='1' WHERE id=279;
UPDATE river_affiliate_category SET name='Personal Care & Pharmacy',  slug='personal-care-pharmacy',  parent_id=264, level=2, icon='Tag', sort=10, updater='1' WHERE id=226;
UPDATE river_affiliate_category SET name='Health & Wellness',         slug='health-wellness',         parent_id=264, level=2, icon='Tag', sort=20, updater='1' WHERE id=190;
UPDATE river_affiliate_category SET name='Games & Toys',             slug='games-toys',              parent_id=234, level=2, icon='Tag', sort=10, updater='1' WHERE id=233;
UPDATE river_affiliate_category SET name='Pet Supplies',             slug='pet-supplies',            parent_id=230, level=2, icon='Tag', sort=10, updater='1' WHERE id=227;
UPDATE river_affiliate_category SET name='Books',                     slug='books',                   parent_id=225, level=2, icon='Tag', sort=10, updater='1' WHERE id=231;
UPDATE river_affiliate_category SET name='Online Education',         slug='online-education',        parent_id=225, level=2, icon='Tag', sort=20, updater='1' WHERE id=235;
UPDATE river_affiliate_category SET name='Finance & Insurance',       slug='finance-insurance',       parent_id=225, level=2, icon='Tag', sort=30, updater='1' WHERE id=232;

-- 事件子分类统一挂 Events & Holidays
UPDATE river_affiliate_category SET name='Cyber Monday 2026',           slug='cyber-monday-2026',           parent_id=@events_id, level=2, icon='Tag', sort=10, updater='1' WHERE id=223;
UPDATE river_affiliate_category SET name='Sale 11.11',                 slug='sale-11-11',                  parent_id=@events_id, level=2, icon='Tag', sort=20, updater='1' WHERE id=248;
UPDATE river_affiliate_category SET name='Ramadan 2024',               slug='ramadan-2024',                parent_id=@events_id, level=2, icon='Tag', sort=30, updater='1' WHERE id=236;
UPDATE river_affiliate_category SET name='Back to School 2026',        slug='back-to-school-2026',         parent_id=@events_id, level=2, icon='Tag', sort=40, updater='1' WHERE id=262;
UPDATE river_affiliate_category SET name='Heroes Marathon 2026',       slug='heroes-marathon-2026',        parent_id=@events_id, level=2, icon='Tag', sort=50, updater='1' WHERE id=247;
UPDATE river_affiliate_category SET name='Green Vibes Fest UA',        slug='green-vibes-fest-ua',         parent_id=@events_id, level=2, icon='Tag', sort=60, updater='1' WHERE id=241;
UPDATE river_affiliate_category SET name='Pack & Earn Travel Marathon 2026', slug='pack-earn-travel-marathon-2026', parent_id=@events_id, level=2, icon='Tag', sort=70, updater='1' WHERE id=251;
UPDATE river_affiliate_category SET name='June AI Fest',               slug='june-ai-fest',                parent_id=@events_id, level=2, icon='Tag', sort=80, updater='1' WHERE id=252;

-- ---------------------------------------------------------------------
-- 5. junction 重映射
--    5a. feed deal 补新顶级标签（源子分类关联保留，双标签）
-- ---------------------------------------------------------------------
-- Furniture(268) deal 补 Home & Garden(267)：87,574 行
INSERT IGNORE INTO river_coupon_deal_category (deal_id, category_id, creator, updater, tenant_id)
SELECT deal_id, 267, '1', '1', 1 FROM river_coupon_deal_category WHERE category_id = 268 AND deleted = 0;
-- Men's Clothing(269) deal 补 Fashion & Apparel(219)：39,114 行
INSERT IGNORE INTO river_coupon_deal_category (deal_id, category_id, creator, updater, tenant_id)
SELECT deal_id, 219, '1', '1', 1 FROM river_coupon_deal_category WHERE category_id = 269 AND deleted = 0;
-- Cell Phones(270) deal 补 Electronics(215)：39,809 行
INSERT IGNORE INTO river_coupon_deal_category (deal_id, category_id, creator, updater, tenant_id)
SELECT deal_id, 215, '1', '1', 1 FROM river_coupon_deal_category WHERE category_id = 270 AND deleted = 0;

-- 5b. 旧类替换（新增目标关联 + 退役源关联）
INSERT IGNORE INTO river_coupon_deal_category (deal_id, category_id, creator, updater, tenant_id)
SELECT deal_id, 267, '1', '1', 1 FROM river_coupon_deal_category WHERE category_id = 216 AND deleted = 0;
UPDATE river_coupon_deal_category SET deleted = 1, update_time = NOW() WHERE category_id = 216 AND deleted = 0;

INSERT IGNORE INTO river_coupon_deal_category (deal_id, category_id, creator, updater, tenant_id)
SELECT deal_id, 271, '1', '1', 1 FROM river_coupon_deal_category WHERE category_id = 221 AND deleted = 0;
UPDATE river_coupon_deal_category SET deleted = 1, update_time = NOW() WHERE category_id = 221 AND deleted = 0;

INSERT IGNORE INTO river_coupon_deal_category (deal_id, category_id, creator, updater, tenant_id)
SELECT deal_id, 229, '1', '1', 1 FROM river_coupon_deal_category WHERE category_id = 181 AND deleted = 0;
UPDATE river_coupon_deal_category SET deleted = 1, update_time = NOW() WHERE category_id = 181 AND deleted = 0;

INSERT IGNORE INTO river_coupon_deal_category (deal_id, category_id, creator, updater, tenant_id)
SELECT deal_id, @gaming_id, '1', '1', 1 FROM river_coupon_deal_category WHERE category_id = 202 AND deleted = 0;
UPDATE river_coupon_deal_category SET deleted = 1, update_time = NOW() WHERE category_id = 202 AND deleted = 0;

INSERT IGNORE INTO river_coupon_deal_category (deal_id, category_id, creator, updater, tenant_id)
SELECT deal_id, 278, '1', '1', 1 FROM river_coupon_deal_category WHERE category_id = 265 AND deleted = 0;
UPDATE river_coupon_deal_category SET deleted = 1, update_time = NOW() WHERE category_id = 265 AND deleted = 0;

-- 5c. 合并冗余子分类（deal 已有父类标签，直接退役）
UPDATE river_coupon_deal_category SET deleted = 1, update_time = NOW() WHERE category_id = 274 AND deleted = 0; -- Home Furniture 并入 Furniture(268)
UPDATE river_coupon_deal_category SET deleted = 1, update_time = NOW() WHERE category_id = 282 AND deleted = 0; -- Furniture Parts 并入 Furniture(268)
UPDATE river_coupon_deal_category SET deleted = 1, update_time = NOW() WHERE category_id = 277 AND deleted = 0; -- Tops & Tees 并入 Men's Clothing(269)
UPDATE river_coupon_deal_category SET deleted = 1, update_time = NOW() WHERE category_id = 281 AND deleted = 0; -- Mobile Phone Cases 并入 Cell Phones(270)

-- ---------------------------------------------------------------------
-- 6. deal.category_ids 与 junction 对齐（分批执行，此处示意；
--    实际由 reorg_categories.py --step recount 按 5000/批执行）
-- ---------------------------------------------------------------------
-- UPDATE river_coupon_deal d JOIN (
--   SELECT deal_id, GROUP_CONCAT(category_id ORDER BY category_id) ids
--   FROM river_coupon_deal_category WHERE deleted = 0 GROUP BY deal_id
-- ) t ON d.id = t.deal_id SET d.category_ids = t.ids;

-- ---------------------------------------------------------------------
-- 7. coupon.category_ids 重写（59 条，映射：216→267 / 221→271 / 202→Gaming / 265→278；
--    实际由 reorg_categories.py --step coupons 执行）
-- ---------------------------------------------------------------------

-- ---------------------------------------------------------------------
-- 8. 退役分类软删除（RU 全部 61 + 旧英文合并冗余 7）
-- ---------------------------------------------------------------------
UPDATE river_affiliate_category SET deleted = 1, updater = '1' WHERE region = 'RU' AND deleted = 0;
UPDATE river_affiliate_category SET deleted = 1, updater = '1' WHERE id IN (216, 221, 265, 274, 277, 281, 282) AND deleted = 0;
