-- 媒体投放：点击日志（单文件完整 DDL）

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `river_mediabuy_click_log`;
CREATE TABLE `river_mediabuy_click_log` (
    `id`                 BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `offer_id`           BIGINT NOT NULL COMMENT 'Offer ID',
    `offer_name`         VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'Offer 名称',
    `merchant_id`        BIGINT NOT NULL DEFAULT 0 COMMENT '商家 ID',
    `merchant_name`      VARCHAR(255) NOT NULL DEFAULT '' COMMENT '商家名称',
    `track_link`         VARCHAR(2048) NOT NULL DEFAULT '' COMMENT '最终跳转链接',
    `network_code`       VARCHAR(64) NOT NULL DEFAULT '' COMMENT '联盟 code',
    `os_type`            VARCHAR(16) NOT NULL DEFAULT 'PC' COMMENT '操作系统类型',
    `country`            VARCHAR(64) NOT NULL DEFAULT '' COMMENT '国家',
    `publisher_click_id` VARCHAR(128) NOT NULL DEFAULT '' COMMENT '外部点击 ID',
    `click_id`           VARCHAR(128) NOT NULL DEFAULT '' COMMENT '系统点击 ID',
    `subid1`             VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'subid1',
    `subid2`             VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'subid2',
    `ip`                 VARCHAR(64) NOT NULL DEFAULT '' COMMENT '访问 IP',
    `user_agent`         VARCHAR(512) NOT NULL DEFAULT '' COMMENT 'User-Agent',
    `referer`            VARCHAR(512) NOT NULL DEFAULT '' COMMENT 'Referer',
    `query_string`       VARCHAR(1024) NOT NULL DEFAULT '' COMMENT 'QueryString',
    `creator`            VARCHAR(64) DEFAULT '' COMMENT '创建者',
    `create_time`        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`            VARCHAR(64) DEFAULT '' COMMENT '更新者',
    `update_time`        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`            TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    `tenant_id`          BIGINT NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`id`) USING BTREE,
    KEY `idx_river_mediabuy_click_log_offer_id` (`offer_id`) USING BTREE,
    KEY `idx_river_mediabuy_click_log_create_time` (`create_time`) USING BTREE,
    KEY `idx_river_mediabuy_click_log_click_id` (`click_id`) USING BTREE,
    KEY `idx_river_mediabuy_click_log_publisher_click_id` (`publisher_click_id`) USING BTREE,
    KEY `idx_river_mediabuy_click_log_network_code` (`network_code`) USING BTREE,
    KEY `idx_river_mediabuy_click_log_os_type` (`os_type`) USING BTREE,
    KEY `idx_river_mediabuy_click_log_country` (`country`) USING BTREE,
    KEY `idx_river_mediabuy_click_log_merchant_id` (`merchant_id`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '媒体投放点击日志表';

SET FOREIGN_KEY_CHECKS = 1;
