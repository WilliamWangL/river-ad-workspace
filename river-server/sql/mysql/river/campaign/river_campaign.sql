-- =============================================
-- River Campaign Module - MySQL 8.0 Schema
-- =============================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 流量来源表
DROP TABLE IF EXISTS `river_campaign_traffic_source`;
CREATE TABLE `river_campaign_traffic_source` (
    `id`              BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `code`            VARCHAR(50) NOT NULL COMMENT '来源编码',
    `name`            VARCHAR(100) NOT NULL COMMENT '来源名称',
    `api_credentials` LONGTEXT COMMENT 'API 凭证',
    `status`          TINYINT NOT NULL DEFAULT 0 COMMENT '状态',
    `creator`         VARCHAR(64) DEFAULT '' COMMENT '创建者',
    `create_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`         VARCHAR(64) DEFAULT '' COMMENT '更新者',
    `update_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`         TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    `tenant_id`       BIGINT NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE KEY `uk_traffic_source_code` (`code`, `tenant_id`, `deleted`) USING BTREE,
    KEY `idx_traffic_source_status` (`status`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '流量来源表';

-- Campaign 表
DROP TABLE IF EXISTS `river_campaign_campaign`;
CREATE TABLE `river_campaign_campaign` (
    `id`                      BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `traffic_source_id`       BIGINT NOT NULL COMMENT '流量来源 ID',
    `name`                    VARCHAR(200) NOT NULL COMMENT 'Campaign 名称',
    `type`                    TINYINT NOT NULL DEFAULT 1 COMMENT 'Campaign 类型',
    `offer_ids`               LONGTEXT COMMENT '关联 Offer ID 列表',
    `landing_page_id`         BIGINT DEFAULT NULL COMMENT '落地页 ID',
    `budget_daily`            DECIMAL(12,2) DEFAULT NULL COMMENT '日预算',
    `budget_total`            DECIMAL(12,2) DEFAULT NULL COMMENT '总预算',
    `external_campaign_id`    VARCHAR(200) DEFAULT NULL COMMENT '外部 Campaign ID',
    `status`                  TINYINT NOT NULL DEFAULT 0 COMMENT '状态',
    `creator`                 VARCHAR(64) DEFAULT '' COMMENT '创建者',
    `create_time`             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`                 VARCHAR(64) DEFAULT '' COMMENT '更新者',
    `update_time`             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`                 TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    `tenant_id`               BIGINT NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`id`) USING BTREE,
    KEY `idx_campaign_traffic_source` (`traffic_source_id`) USING BTREE,
    KEY `idx_campaign_status` (`status`) USING BTREE,
    KEY `idx_campaign_type` (`type`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Campaign/广告活动表';

-- 广告组表
DROP TABLE IF EXISTS `river_campaign_ad_group`;
CREATE TABLE `river_campaign_ad_group` (
    `id`                  BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `campaign_id`         BIGINT NOT NULL COMMENT 'Campaign ID',
    `name`                VARCHAR(200) NOT NULL COMMENT '广告组名称',
    `targeting`           LONGTEXT COMMENT '定向配置',
    `bid_strategy`        VARCHAR(100) DEFAULT NULL COMMENT '出价策略',
    `external_ad_group_id` VARCHAR(200) DEFAULT NULL COMMENT '外部广告组 ID',
    `status`              TINYINT NOT NULL DEFAULT 0 COMMENT '状态',
    `creator`             VARCHAR(64) DEFAULT '' COMMENT '创建者',
    `create_time`         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`             VARCHAR(64) DEFAULT '' COMMENT '更新者',
    `update_time`         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`             TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    `tenant_id`           BIGINT NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`id`) USING BTREE,
    KEY `idx_ad_group_campaign` (`campaign_id`) USING BTREE,
    KEY `idx_ad_group_status` (`status`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '广告组表';

-- 落地页表
DROP TABLE IF EXISTS `river_campaign_landing_page`;
CREATE TABLE `river_campaign_landing_page` (
    `id`              BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `name`            VARCHAR(200) NOT NULL COMMENT '落地页名称',
    `slug`            VARCHAR(100) NOT NULL COMMENT '落地页别名',
    `type`            TINYINT NOT NULL DEFAULT 1 COMMENT '落地页类型',
    `url`             VARCHAR(1000) DEFAULT NULL COMMENT '落地页 URL',
    `offer_id`        BIGINT DEFAULT NULL COMMENT '关联 Offer ID',
    `content`         LONGTEXT COMMENT '页面内容',
    `status`          TINYINT NOT NULL DEFAULT 0 COMMENT '状态',
    `creator`         VARCHAR(64) DEFAULT '' COMMENT '创建者',
    `create_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`         VARCHAR(64) DEFAULT '' COMMENT '更新者',
    `update_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`         TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    `tenant_id`       BIGINT NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE KEY `uk_landing_page_slug` (`slug`, `tenant_id`, `deleted`) USING BTREE,
    KEY `idx_landing_page_status` (`status`) USING BTREE,
    KEY `idx_landing_page_type` (`type`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '落地页表';

-- 成本记录表
DROP TABLE IF EXISTS `river_campaign_cost_record`;
CREATE TABLE `river_campaign_cost_record` (
    `id`              BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `campaign_id`     BIGINT NOT NULL COMMENT 'Campaign ID',
    `ad_group_id`     BIGINT DEFAULT NULL COMMENT '广告组 ID',
    `date`            DATE NOT NULL COMMENT '日期',
    `impressions`     INT DEFAULT 0 COMMENT '展示数',
    `clicks`          INT DEFAULT 0 COMMENT '点击数',
    `cost`            DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT '成本',
    `currency`        VARCHAR(10) NOT NULL DEFAULT 'USD' COMMENT '货币',
    `source`          TINYINT NOT NULL DEFAULT 1 COMMENT '数据来源',
    `creator`         VARCHAR(64) DEFAULT '' COMMENT '创建者',
    `create_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`         VARCHAR(64) DEFAULT '' COMMENT '更新者',
    `update_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`         TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    `tenant_id`       BIGINT NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`id`) USING BTREE,
    KEY `idx_cost_record_campaign` (`campaign_id`) USING BTREE,
    KEY `idx_cost_record_ad_group` (`ad_group_id`) USING BTREE,
    KEY `idx_cost_record_date` (`date`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '成本记录表';

-- 货币表
DROP TABLE IF EXISTS `river_campaign_currency`;
CREATE TABLE `river_campaign_currency` (
    `id`              BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `code`            VARCHAR(10) NOT NULL COMMENT '货币代码',
    `name`            VARCHAR(50) NOT NULL COMMENT '货币名称',
    `symbol`          VARCHAR(10) DEFAULT NULL COMMENT '货币符号',
    `decimal_places`  TINYINT NOT NULL DEFAULT 2 COMMENT '小数位',
    `status`          TINYINT NOT NULL DEFAULT 0 COMMENT '状态',
    `creator`         VARCHAR(64) DEFAULT '' COMMENT '创建者',
    `create_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`         VARCHAR(64) DEFAULT '' COMMENT '更新者',
    `update_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`         TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    `tenant_id`       BIGINT NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE KEY `uk_currency_code` (`code`, `tenant_id`, `deleted`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '货币表';

-- 汇率表
DROP TABLE IF EXISTS `river_campaign_fx_rate`;
CREATE TABLE `river_campaign_fx_rate` (
    `id`              BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `from_currency`   VARCHAR(10) NOT NULL COMMENT '源货币',
    `to_currency`     VARCHAR(10) NOT NULL COMMENT '目标货币',
    `rate`            DECIMAL(18,8) NOT NULL COMMENT '汇率',
    `effective_date`  DATE NOT NULL COMMENT '生效日期',
    `creator`         VARCHAR(64) DEFAULT '' COMMENT '创建者',
    `create_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`         VARCHAR(64) DEFAULT '' COMMENT '更新者',
    `update_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`         TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    `tenant_id`       BIGINT NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`id`) USING BTREE,
    KEY `idx_fx_rate_currencies` (`from_currency`, `to_currency`) USING BTREE,
    KEY `idx_fx_rate_effective_date` (`effective_date`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '汇率表';

SET FOREIGN_KEY_CHECKS = 1;
