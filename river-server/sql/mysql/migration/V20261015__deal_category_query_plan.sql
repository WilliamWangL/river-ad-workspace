-- =====================================================================
-- Deal 分类查询执行计划优化（deal-category 关联表达百万行级）
--
-- 背景：AliExpress 商品批量导入后，按分类分页查询（page + count）退化到
-- 秒级：优化器对 EXISTS/IN 子查询的 semijoin 计划不稳定，退化为
-- 关联表驱动 + deal 宽行（含 description/image_urls/regions 大字段）
-- 全量回表 + filesort。DealMapper 已改为显式 JOIN + 索引提示的
-- 确定性计划，本文件提供配套索引：
--
-- 1. deal 表窄覆盖索引：分类计数按 (id, tenant_id, status, deleted)
--    四列单行点查，避免回读宽行（idx_deal_id_filters）
-- 2. deal_category 表覆盖索引扩展：按 category 前缀扫描时直接带出
--    deal_id，免去逐行回读关联表主键行（idx_dcat_category_cover
--    替换原 idx_dcat_category_tenant）
--
-- 注意：DealMapper.selectCountByCategory 使用 USE INDEX (idx_deal_id_filters)，
-- 需先执行本迁移再部署对应版本服务。
-- =====================================================================

-- 1. deal 表窄覆盖索引（count/内层过滤点查用，含 merchant_id
--    以覆盖最常见的「分类 + 商家」组合，避免逐条回读宽行）
ALTER TABLE river_coupon_deal
    ADD KEY idx_deal_id_filters (id, tenant_id, status, deleted, merchant_id);

-- 2. deal_category 表覆盖索引替换（扫描时带出 deal_id）
ALTER TABLE river_coupon_deal_category
    DROP KEY idx_dcat_category_tenant,
    ADD KEY idx_dcat_category_cover (category_id, tenant_id, deleted, deal_id);
