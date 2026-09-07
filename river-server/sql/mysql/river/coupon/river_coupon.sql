-- =============================================
-- River Coupon Module - MySQL 8.0 Schema
-- =============================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 优惠券表
DROP TABLE IF EXISTS `river_coupon_coupon`;
CREATE TABLE `river_coupon_coupon` (
    `id`              BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `merchant_id`     BIGINT NOT NULL COMMENT '商家 ID',
    `offer_id`        BIGINT DEFAULT NULL COMMENT 'Offer ID',
    `code`            VARCHAR(100) NOT NULL COMMENT '优惠码',
    `discount_type`   TINYINT NOT NULL DEFAULT 1 COMMENT '折扣类型',
    `discount_value`  DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '折扣值',
    `min_purchase`    DECIMAL(10,2) DEFAULT NULL COMMENT '最低消费',
    `start_time`      DATETIME DEFAULT NULL COMMENT '开始时间',
    `end_time`        DATETIME DEFAULT NULL COMMENT '结束时间',
    `terms`           LONGTEXT COMMENT '使用条款',
    `source`          TINYINT NOT NULL DEFAULT 2 COMMENT '来源',
    `verified`        TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已验证',
    `hot_score`       INT NOT NULL DEFAULT 0 COMMENT '热度分数',
    `status`          TINYINT NOT NULL DEFAULT 0 COMMENT '状态',
    `external_id`     VARCHAR(100) DEFAULT NULL COMMENT '联盟原始ID',
    `network_id`      BIGINT DEFAULT NULL COMMENT '来源联盟网络ID',
    `title`           VARCHAR(300) DEFAULT NULL COMMENT '优惠券标题',
    `regions`         LONGTEXT COMMENT '适用地区(ISO代码,逗号分隔)',
    `category_ids`    LONGTEXT COMMENT '分类ID(逗号分隔)',
    `image_url`       VARCHAR(500) DEFAULT NULL COMMENT '图片URL',
    `goto_url`        VARCHAR(1000) DEFAULT NULL COMMENT '跳转链接',
    `exclusive`       TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否独家',
    `coupon_type`     TINYINT NOT NULL DEFAULT 1 COMMENT '类型:1=promocode,2=sale,3=deal',
    `creator`         VARCHAR(64) DEFAULT '' COMMENT '创建者',
    `create_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`         VARCHAR(64) DEFAULT '' COMMENT '更新者',
    `update_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`         TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    `tenant_id`       BIGINT NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE KEY `uk_coupon_network_external` (`network_id`, `external_id`, `tenant_id`, `deleted`) USING BTREE,
    KEY `idx_coupon_merchant` (`merchant_id`) USING BTREE,
    KEY `idx_coupon_offer` (`offer_id`) USING BTREE,
    KEY `idx_coupon_status` (`status`) USING BTREE,
    KEY `idx_coupon_verified` (`verified`) USING BTREE,
    KEY `idx_coupon_end_time` (`end_time`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '优惠券表';

-- Deal 表
DROP TABLE IF EXISTS `river_coupon_deal`;
CREATE TABLE `river_coupon_deal` (
    `id`               BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `merchant_id`      BIGINT NOT NULL COMMENT '商家 ID',
    `offer_id`         BIGINT DEFAULT NULL COMMENT 'Offer ID',
    `title`            VARCHAR(300) NOT NULL COMMENT 'Deal 标题',
    `slug`             VARCHAR(300) DEFAULT NULL COMMENT 'Deal 别名',
    `description`      LONGTEXT COMMENT 'Deal 描述',
    `original_price`   DECIMAL(10,2) DEFAULT NULL COMMENT '原价',
    `deal_price`       DECIMAL(10,2) DEFAULT NULL COMMENT 'Deal 价格',
    `discount_percent` TINYINT DEFAULT NULL COMMENT '折扣百分比',
    `start_time`       DATETIME DEFAULT NULL COMMENT '开始时间',
    `end_time`         DATETIME DEFAULT NULL COMMENT '结束时间',
    `stock_limit`      INT DEFAULT NULL COMMENT '库存限制',
    `image_url`        VARCHAR(500) DEFAULT NULL COMMENT '图片 URL',
    `hot_score`        INT NOT NULL DEFAULT 0 COMMENT '热度分数',
    `featured`         TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否推荐',
    `status`           TINYINT NOT NULL DEFAULT 1 COMMENT '状态',
    `external_id`      VARCHAR(100) DEFAULT NULL COMMENT '联盟原始ID',
    `network_id`       BIGINT DEFAULT NULL COMMENT '来源联盟网络ID',
    `regions`          LONGTEXT COMMENT '适用地区(ISO代码,逗号分隔)',
    `category_ids`     LONGTEXT COMMENT '分类ID(逗号分隔)',
    `goto_url`         VARCHAR(1000) DEFAULT NULL COMMENT '跳转链接',
    `exclusive`        TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否独家',
    `creator`          VARCHAR(64) DEFAULT '' COMMENT '创建者',
    `create_time`      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`          VARCHAR(64) DEFAULT '' COMMENT '更新者',
    `update_time`      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`          TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    `tenant_id`        BIGINT NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE KEY `uk_deal_slug` (`slug`, `tenant_id`, `deleted`) USING BTREE,
    UNIQUE KEY `uk_deal_network_external` (`network_id`, `external_id`, `tenant_id`, `deleted`) USING BTREE,
    KEY `idx_deal_merchant` (`merchant_id`) USING BTREE,
    KEY `idx_deal_offer` (`offer_id`) USING BTREE,
    KEY `idx_deal_status` (`status`) USING BTREE,
    KEY `idx_deal_featured` (`featured`) USING BTREE,
    KEY `idx_deal_end_time` (`end_time`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Deal/优惠活动表';

SET FOREIGN_KEY_CHECKS = 1;
