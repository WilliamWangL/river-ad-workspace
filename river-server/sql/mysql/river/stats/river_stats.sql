-- =============================================
-- River Stats Module - MySQL 8.0 Schema
-- =============================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 日报统计表
DROP TABLE IF EXISTS `river_stats_daily`;
CREATE TABLE `river_stats_daily` (
    `id`              BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `date`            DATE NOT NULL COMMENT '统计日期',
    `dimension_type`  TINYINT NOT NULL COMMENT '维度类型：1-OFFER 2-CAMPAIGN 3-SOURCE 4-MERCHANT 5-CATEGORY 6-AUTHOR',
    `dimension_id`    BIGINT NOT NULL COMMENT '维度 ID',
    `clicks`          INT NOT NULL DEFAULT 0 COMMENT '点击数',
    `conversions`     INT NOT NULL DEFAULT 0 COMMENT '转化数',
    `revenue`         DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT '收入',
    `cost`            DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT '成本',
    `profit`          DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT '利润',
    `epc`             DECIMAL(10,4) NOT NULL DEFAULT 0 COMMENT '每次点击收益',
    `cr`              DECIMAL(8,4) NOT NULL DEFAULT 0 COMMENT '转化率',
    `roi`             DECIMAL(10,4) NOT NULL DEFAULT 0 COMMENT '投资回报率',
    `creator`         VARCHAR(64) DEFAULT '' COMMENT '创建者',
    `create_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`         VARCHAR(64) DEFAULT '' COMMENT '更新者',
    `update_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`         TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    `tenant_id`       BIGINT NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE KEY `uk_stats_daily_dimension_date` (`date`, `dimension_type`, `dimension_id`, `tenant_id`, `deleted`) USING BTREE,
    KEY `idx_stats_daily_date` (`date`) USING BTREE,
    KEY `idx_stats_daily_dimension` (`dimension_type`, `dimension_id`) USING BTREE,
    KEY `idx_stats_daily_tenant` (`tenant_id`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '日报统计表';

-- 小时统计表
DROP TABLE IF EXISTS `river_stats_hourly`;
CREATE TABLE `river_stats_hourly` (
    `id`              BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `hour`            DATETIME NOT NULL COMMENT '小时时间点',
    `dimension_type`  TINYINT NOT NULL COMMENT '维度类型：1-OFFER 2-CAMPAIGN 3-SOURCE 4-MERCHANT 5-CATEGORY 6-AUTHOR',
    `dimension_id`    BIGINT NOT NULL COMMENT '维度 ID',
    `clicks`          INT NOT NULL DEFAULT 0 COMMENT '点击数',
    `conversions`     INT NOT NULL DEFAULT 0 COMMENT '转化数',
    `revenue`         DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT '收入',
    `cost`            DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT '成本',
    `creator`         VARCHAR(64) DEFAULT '' COMMENT '创建者',
    `create_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`         VARCHAR(64) DEFAULT '' COMMENT '更新者',
    `update_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`         TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    `tenant_id`       BIGINT NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE KEY `uk_stats_hourly_dimension_hour` (`hour`, `dimension_type`, `dimension_id`, `tenant_id`, `deleted`) USING BTREE,
    KEY `idx_stats_hourly_hour` (`hour`) USING BTREE,
    KEY `idx_stats_hourly_dimension` (`dimension_type`, `dimension_id`) USING BTREE,
    KEY `idx_stats_hourly_tenant` (`tenant_id`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '小时统计表（保留 7 天）';

SET FOREIGN_KEY_CHECKS = 1;
