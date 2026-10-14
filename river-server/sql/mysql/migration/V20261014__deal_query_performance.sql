-- =====================================================================
-- Deal 列表查询性能优化（80 万级数据量）
-- 1. 复合索引：覆盖列表页 WHERE tenant_id/status/deleted 等值过滤，
--    二级索引隐含主键 id，可倒序扫描支撑 ORDER BY id DESC 的深分页
-- 2. Deal-分类关联表：替代 FIND_IN_SET(category_ids) 全表扫描
-- =====================================================================

-- 1. 列表页复合索引（翻页 COUNT + ORDER BY id DESC LIMIT）
ALTER TABLE river_coupon_deal
    ADD KEY idx_deal_tenant_status_deleted (tenant_id, status, deleted);

-- 2. Deal-分类关联表（junction table）
CREATE TABLE IF NOT EXISTS river_coupon_deal_category (
    id          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
    deal_id     BIGINT       NOT NULL COMMENT 'Deal ID',
    category_id BIGINT       NOT NULL COMMENT '分类 ID',
    creator     VARCHAR(64)  DEFAULT '' COMMENT '创建者',
    create_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updater     VARCHAR(64)  DEFAULT '' COMMENT '更新者',
    update_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted     TINYINT      NOT NULL DEFAULT 0 COMMENT '是否删除',
    tenant_id   BIGINT       NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (id),
    UNIQUE KEY uk_deal_category (deal_id, category_id),
    KEY idx_dcat_category_tenant (category_id, tenant_id, deleted)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Deal 分类关联表';

-- 3. 回填存量 category_ids（逗号分隔拆分为多行，单 deal 最多 8 个分类）
INSERT IGNORE INTO river_coupon_deal_category (deal_id, category_id, tenant_id, creator, updater)
SELECT d.id,
       CAST(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(d.category_ids, ',', n.n), ',', -1)) AS UNSIGNED),
       d.tenant_id, '1', '1'
FROM river_coupon_deal d
JOIN (
    SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
    UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8
) n ON n.n <= LENGTH(d.category_ids) - LENGTH(REPLACE(d.category_ids, ',', '')) + 1
WHERE d.category_ids IS NOT NULL
  AND d.category_ids != '';
