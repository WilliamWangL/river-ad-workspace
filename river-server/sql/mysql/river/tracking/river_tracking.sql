-- =============================================
-- River Tracking Module - MySQL 8.0 Schema
-- =============================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 点击记录表 (ULID 主键，按月分区)
-- 注意：MySQL 8 分区键必须包含在主键中，因此主键为 (click_time, click_id)
DROP TABLE IF EXISTS `river_tracking_click`;
CREATE TABLE `river_tracking_click` (
    `click_id`            VARCHAR(26) NOT NULL COMMENT 'ULID 格式主键',
    `target_type`         TINYINT NOT NULL COMMENT '目标类型: 1=商家, 2=Offer, 3=Deal, 4=优惠券',
    `target_id`           BIGINT NOT NULL COMMENT '目标实体 ID',
    `merchant_id`         BIGINT DEFAULT NULL COMMENT '商家 ID（冗余字段，便于统计）',
    `merchant_name`       VARCHAR(200) DEFAULT NULL COMMENT '商家名称（冗余字段，便于展示）',
    `coupon_id`           BIGINT DEFAULT NULL COMMENT '优惠券 ID（冗余字段，targetType=4 时填充）',
    `deal_id`             BIGINT DEFAULT NULL COMMENT 'Deal ID（冗余字段，targetType=3 时填充）',
    `goto_url`            LONGTEXT DEFAULT NULL COMMENT '实际跳转使用的 gotoUrl',
    `campaign_id`         BIGINT DEFAULT NULL COMMENT 'Campaign ID',
    `landing_page_id`     BIGINT DEFAULT NULL COMMENT '落地页 ID',
    `sub1`                VARCHAR(200) DEFAULT NULL COMMENT '自定义追踪参数1',
    `sub2`                VARCHAR(200) DEFAULT NULL COMMENT '自定义追踪参数2',
    `sub3`                VARCHAR(200) DEFAULT NULL COMMENT '自定义追踪参数3',
    `sub4`                VARCHAR(200) DEFAULT NULL COMMENT '自定义追踪参数4',
    `sub5`                VARCHAR(200) DEFAULT NULL COMMENT '自定义追踪参数5',
    `ip`                  VARCHAR(50) DEFAULT NULL COMMENT '访问 IP',
    `user_agent`          LONGTEXT COMMENT 'User-Agent',
    `referer`             LONGTEXT COMMENT 'Referer',
    `device_type`         VARCHAR(50) DEFAULT NULL COMMENT '设备类型',
    `country`             VARCHAR(10) DEFAULT NULL COMMENT '国家',
    `click_time`          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '点击时间',
    `creator`             VARCHAR(64) DEFAULT '' COMMENT '创建者',
    `create_time`         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`             VARCHAR(64) DEFAULT '' COMMENT '更新者',
    `update_time`         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`             TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    `tenant_id`           BIGINT NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`click_time`, `click_id`) USING BTREE,
    KEY `idx_tracking_click_target` (`target_type`, `target_id`) USING BTREE,
    KEY `idx_tracking_click_merchant` (`merchant_id`) USING BTREE,
    KEY `idx_tracking_click_coupon` (`coupon_id`) USING BTREE,
    KEY `idx_tracking_click_deal` (`deal_id`) USING BTREE,
    KEY `idx_tracking_click_campaign` (`campaign_id`) USING BTREE,
    KEY `idx_tracking_click_time` (`click_time`) USING BTREE,
    KEY `idx_tracking_click_tenant_time` (`tenant_id`, `click_time`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '点击追踪记录表（按月分区）'
PARTITION BY RANGE (YEAR(`click_time`) * 100 + MONTH(`click_time`)) (
    PARTITION p202601 VALUES LESS THAN (202602),
    PARTITION p202602 VALUES LESS THAN (202603),
    PARTITION p202603 VALUES LESS THAN (202604),
    PARTITION p202604 VALUES LESS THAN (202605),
    PARTITION p202605 VALUES LESS THAN (202606),
    PARTITION p202606 VALUES LESS THAN (202607),
    PARTITION p202607 VALUES LESS THAN (202608),
    PARTITION p202608 VALUES LESS THAN (202609),
    PARTITION p202609 VALUES LESS THAN (202610),
    PARTITION p202610 VALUES LESS THAN (202611),
    PARTITION p202611 VALUES LESS THAN (202612),
    PARTITION p202612 VALUES LESS THAN (202613),
    PARTITION pmax VALUES LESS THAN MAXVALUE
);

-- 转化记录表
DROP TABLE IF EXISTS `river_tracking_conversion`;
CREATE TABLE `river_tracking_conversion` (
    `id`                      BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `click_id`                VARCHAR(26) DEFAULT NULL COMMENT '点击 ID',
    `target_type`             TINYINT DEFAULT NULL COMMENT '目标类型（冗余字段）',
    `target_id`               BIGINT DEFAULT NULL COMMENT '目标实体 ID（冗余字段）',
    `merchant_id`             BIGINT DEFAULT NULL COMMENT '商家 ID（冗余字段）',
    `network_code`            VARCHAR(50) NOT NULL COMMENT '联盟 code',
    `external_conversion_id`  VARCHAR(200) NOT NULL COMMENT '外部转化 ID',
    `conversion_type`         TINYINT NOT NULL DEFAULT 2 COMMENT '转化类型: 1=Lead, 2=Sale, 3=Install, 4=Signup',
    `commission`              DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT '佣金',
    `currency`                VARCHAR(10) NOT NULL DEFAULT 'USD' COMMENT '货币',
    `status`                  TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0=待确认, 1=已确认, 2=已拒绝, 3=已撤销',
    `network_payload`         LONGTEXT COMMENT '联盟回调原始数据',
    `conversion_time`         DATETIME NOT NULL COMMENT '转化时间',
    `creator`                 VARCHAR(64) DEFAULT '' COMMENT '创建者',
    `create_time`             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`                 VARCHAR(64) DEFAULT '' COMMENT '更新者',
    `update_time`             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`                 TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    `tenant_id`               BIGINT NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE KEY `uk_conversion_network_external` (`tenant_id`, `network_code`, `external_conversion_id`, `deleted`) USING BTREE,
    KEY `idx_conversion_click` (`click_id`) USING BTREE,
    KEY `idx_conversion_status` (`status`) USING BTREE,
    KEY `idx_conversion_time` (`conversion_time`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '转化记录表';

-- 追踪链接表
DROP TABLE IF EXISTS `river_tracking_link`;
CREATE TABLE `river_tracking_link` (
    `id`              BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `target_type`     TINYINT NOT NULL COMMENT '目标类型: 1=商家, 2=Offer, 3=Deal, 4=优惠券',
    `target_id`       BIGINT NOT NULL COMMENT '目标实体 ID',
    `merchant_id`     BIGINT DEFAULT NULL COMMENT '商家 ID（冗余字段，便于点击记录填充）',
    `slug`            VARCHAR(100) NOT NULL COMMENT '短链接标识',
    `preset_sub1`     VARCHAR(200) DEFAULT NULL COMMENT '预设 sub1',
    `preset_sub2`     VARCHAR(200) DEFAULT NULL COMMENT '预设 sub2',
    `preset_sub3`     VARCHAR(200) DEFAULT NULL COMMENT '预设 sub3',
    `preset_sub4`     VARCHAR(200) DEFAULT NULL COMMENT '预设 sub4',
    `preset_sub5`     VARCHAR(200) DEFAULT NULL COMMENT '预设 sub5',
    `utm_params`      LONGTEXT COMMENT 'UTM 参数',
    `tracking_url`    LONGTEXT COMMENT '追加参数后的完整追踪链接',
    `status`          TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0=禁用, 1=启用',
    `creator`         VARCHAR(64) DEFAULT '' COMMENT '创建者',
    `create_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`         VARCHAR(64) DEFAULT '' COMMENT '更新者',
    `update_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`         TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    `tenant_id`       BIGINT NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE KEY `uk_tracking_link_slug` (`slug`, `tenant_id`, `deleted`) USING BTREE,
    KEY `idx_tracking_link_target` (`target_type`, `target_id`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '追踪链接表';

-- 未归因转化表
DROP TABLE IF EXISTS `river_tracking_unattributed_conversion`;
CREATE TABLE `river_tracking_unattributed_conversion` (
    `id`                      BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `network_code`            VARCHAR(50) NOT NULL COMMENT '联盟 code',
    `external_conversion_id`  VARCHAR(200) NOT NULL COMMENT '外部转化 ID',
    `conversion_type`         TINYINT DEFAULT NULL COMMENT '转化类型',
    `commission`              DECIMAL(12,4) DEFAULT NULL COMMENT '佣金',
    `currency`                VARCHAR(10) DEFAULT NULL COMMENT '货币',
    `network_payload`         LONGTEXT COMMENT '联盟回调原始数据',
    `raw_request`             LONGTEXT COMMENT '原始请求',
    `attribution_fail_reason` VARCHAR(500) DEFAULT NULL COMMENT '归因失败原因',
    `conversion_time`         DATETIME DEFAULT NULL COMMENT '转化时间',
    `creator`                 VARCHAR(64) DEFAULT '' COMMENT '创建者',
    `create_time`             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`                 VARCHAR(64) DEFAULT '' COMMENT '更新者',
    `update_time`             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`                 TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    `tenant_id`               BIGINT NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`id`) USING BTREE,
    KEY `idx_unattributed_network` (`network_code`) USING BTREE,
    KEY `idx_unattributed_time` (`create_time`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '未归因转化记录表';

-- 归因记录表
DROP TABLE IF EXISTS `river_tracking_attribution`;
CREATE TABLE `river_tracking_attribution` (
    `id`                  BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `conversion_id`       BIGINT NOT NULL COMMENT '转化 ID',
    `click_id`            VARCHAR(26) NOT NULL COMMENT '点击 ID',
    `attribution_type`    TINYINT NOT NULL DEFAULT 1 COMMENT '归因类型: 1=最后点击, 2=首次点击, 3=线性归因',
    `confidence_score`    TINYINT NOT NULL DEFAULT 100 COMMENT '归因置信度(0-100)',
    `attribution_window`  BIGINT DEFAULT NULL COMMENT '归因窗口(毫秒)',
    `creator`             VARCHAR(64) DEFAULT '' COMMENT '创建者',
    `create_time`         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`             VARCHAR(64) DEFAULT '' COMMENT '更新者',
    `update_time`         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`             TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    `tenant_id`           BIGINT NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`id`) USING BTREE,
    KEY `idx_attribution_conversion` (`conversion_id`) USING BTREE,
    KEY `idx_attribution_click` (`click_id`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '归因记录表';

SET FOREIGN_KEY_CHECKS = 1;
