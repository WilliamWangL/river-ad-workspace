-- =====================================================
-- 分类与优惠券同步功能 - 数据库迁移脚本（MySQL 版）
-- 版本: V2026.01.16
-- 描述: 添加分类映射表，扩展 Coupon/Deal 表字段
-- =====================================================

-- =====================================================
-- 1. 创建分类映射表
-- =====================================================
CREATE TABLE IF NOT EXISTS `river_affiliate_category_mapping` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '编号',
  `network_id` bigint NOT NULL COMMENT '联盟网络 ID',
  `external_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '联盟分类 ID',
  `external_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '联盟分类名称（原始）',
  `external_parent_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '联盟父分类 ID',
  `category_id` bigint NULL DEFAULT NULL COMMENT '本地分类 ID（可为空，表示未映射）',
  `auto_created` bit(1) NOT NULL DEFAULT b'0' COMMENT '是否自动创建的映射',
  `creator` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '创建者',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updater` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '更新者',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` bit(1) NOT NULL DEFAULT b'0' COMMENT '是否删除',
  `tenant_id` bigint NOT NULL DEFAULT 0 COMMENT '租户编号',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_category_mapping_network_external` (`network_id`, `external_id`),
  KEY `idx_category_mapping_category_id` (`category_id`)
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '联盟分类映射表' ROW_FORMAT = DYNAMIC;

-- =====================================================
-- 2. 扩展 river_coupon_coupon 表
-- =====================================================
ALTER TABLE `river_coupon_coupon`
  ADD COLUMN `external_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '联盟原始ID',
  ADD COLUMN `network_id` bigint NULL DEFAULT NULL COMMENT '来源联盟网络ID',
  ADD COLUMN `title` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '优惠券标题',
  ADD COLUMN `regions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '适用地区(ISO代码,逗号分隔)',
  ADD COLUMN `category_ids` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '分类ID(逗号分隔)',
  ADD COLUMN `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '图片URL',
  ADD COLUMN `goto_url` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '跳转链接',
  ADD COLUMN `exclusive` bit(1) NOT NULL DEFAULT b'0' COMMENT '是否独家',
  ADD COLUMN `coupon_type` tinyint NOT NULL DEFAULT 1 COMMENT '类型:1=promocode,2=sale,3=deal';

CREATE UNIQUE INDEX `uk_coupon_network_external` ON `river_coupon_coupon` (`network_id`, `external_id`);

-- =====================================================
-- 3. 扩展 river_coupon_deal 表
-- =====================================================
ALTER TABLE `river_coupon_deal`
  ADD COLUMN `external_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '联盟原始ID',
  ADD COLUMN `network_id` bigint NULL DEFAULT NULL COMMENT '来源联盟网络ID',
  ADD COLUMN `regions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '适用地区(ISO代码,逗号分隔)',
  ADD COLUMN `category_ids` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '分类ID(逗号分隔)',
  ADD COLUMN `goto_url` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '跳转链接',
  ADD COLUMN `exclusive` bit(1) NOT NULL DEFAULT b'0' COMMENT '是否独家';

CREATE UNIQUE INDEX `uk_deal_network_external` ON `river_coupon_deal` (`network_id`, `external_id`);
