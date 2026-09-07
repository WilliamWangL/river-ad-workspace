-- =============================================
-- River Affiliate Module - MySQL 8.0 Schema
-- =============================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 联盟网络表
DROP TABLE IF EXISTS `river_affiliate_network`;
CREATE TABLE `river_affiliate_network` (
    `id`              BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `code`            VARCHAR(50) NOT NULL COMMENT '联盟编码',
    `name`            VARCHAR(100) NOT NULL COMMENT '联盟名称',
    `type`            TINYINT NOT NULL DEFAULT 1 COMMENT '联盟类型',
    `api_base_url`    VARCHAR(500) DEFAULT NULL COMMENT 'API 基础地址',
    `status`          TINYINT NOT NULL DEFAULT 0 COMMENT '状态',
    `website_url`     VARCHAR(500) DEFAULT NULL COMMENT '联盟官网',
    `logo_url`        VARCHAR(500) DEFAULT NULL COMMENT 'Logo URL',
    `description`     TEXT COMMENT '描述',
    `remark`          VARCHAR(500) DEFAULT NULL COMMENT '备注',
    `creator`         VARCHAR(64) DEFAULT '' COMMENT '创建者',
    `create_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`         VARCHAR(64) DEFAULT '' COMMENT '更新者',
    `update_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`         TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    `tenant_id`       BIGINT NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE KEY `uk_affiliate_network_code` (`code`, `tenant_id`, `deleted`) USING BTREE,
    KEY `idx_affiliate_network_status` (`status`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '联盟网络表';

-- 联盟凭证表
DROP TABLE IF EXISTS `river_affiliate_network_credential`;
CREATE TABLE `river_affiliate_network_credential` (
    `id`              BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `network_id`      BIGINT NOT NULL COMMENT '联盟网络 ID',
    `auth_type`       TINYINT NOT NULL COMMENT '认证类型',
    `credentials`     LONGTEXT NOT NULL COMMENT '凭证内容',
    `expires_at`      DATETIME DEFAULT NULL COMMENT '过期时间',
    `enabled`         TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
    `creator`         VARCHAR(64) DEFAULT '' COMMENT '创建者',
    `create_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`         VARCHAR(64) DEFAULT '' COMMENT '更新者',
    `update_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`         TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    `tenant_id`       BIGINT NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`id`) USING BTREE,
    KEY `idx_network_credential_network` (`network_id`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '联盟网络凭证表';

-- Postback 密钥表
DROP TABLE IF EXISTS `river_affiliate_postback_secret`;
CREATE TABLE `river_affiliate_postback_secret` (
    `id`                      BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `network_id`              BIGINT NOT NULL COMMENT '联盟网络 ID',
    `secret_key`              VARCHAR(200) NOT NULL COMMENT '密钥',
    `algorithm`               VARCHAR(50) NOT NULL DEFAULT 'HMAC-SHA256' COMMENT '签名算法',
    `allowed_ips`             LONGTEXT COMMENT '允许 IP 列表',
    `ip_whitelist_enabled`    TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否启用 IP 白名单',
    `signature_enabled`       TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用签名验证',
    `creator`                 VARCHAR(64) DEFAULT '' COMMENT '创建者',
    `create_time`             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`                 VARCHAR(64) DEFAULT '' COMMENT '更新者',
    `update_time`             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`                 TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    `tenant_id`               BIGINT NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`id`) USING BTREE,
    KEY `idx_postback_secret_network` (`network_id`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Postback回调验证配置表';

-- 商家表
DROP TABLE IF EXISTS `river_affiliate_merchant`;
CREATE TABLE `river_affiliate_merchant` (
    `id`              BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `network_id`      BIGINT NOT NULL COMMENT '联盟网络 ID',
    `external_id`     VARCHAR(100) DEFAULT NULL COMMENT '联盟侧商家 ID',
    `name`            VARCHAR(200) NOT NULL COMMENT '商家名称',
    `slug`            VARCHAR(200) DEFAULT NULL COMMENT '商家别名',
    `domain`          VARCHAR(200) DEFAULT NULL COMMENT '商家域名',
    `logo_url`        VARCHAR(500) DEFAULT NULL COMMENT 'Logo URL',
    `description`     LONGTEXT COMMENT '商家描述（联盟同步原始描述，回退值）',
    `intro`           LONGTEXT COMMENT '商家简介（短文本，为空回退 description）',
    `about`           LONGTEXT COMMENT '商家描述（长富文本，为空回退 description）',
    `rating`          DECIMAL(3,2) DEFAULT NULL COMMENT '评分',
    `status`          TINYINT NOT NULL DEFAULT 0 COMMENT '状态',
    `regions`         LONGTEXT COMMENT '支持地区',
    `category_ids`    LONGTEXT COMMENT '分类 ID 列表',
    `creator`         VARCHAR(64) DEFAULT '' COMMENT '创建者',
    `create_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`         VARCHAR(64) DEFAULT '' COMMENT '更新者',
    `update_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`         TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    `tenant_id`       BIGINT NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE KEY `uk_merchant_slug` (`slug`, `tenant_id`, `deleted`) USING BTREE,
    UNIQUE KEY `uk_merchant_external` (`network_id`, `external_id`, `tenant_id`, `deleted`) USING BTREE,
    KEY `idx_merchant_network` (`network_id`) USING BTREE,
    KEY `idx_merchant_status` (`status`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '商家/广告主表';

-- 分类表
DROP TABLE IF EXISTS `river_affiliate_category`;
CREATE TABLE `river_affiliate_category` (
    `id`              BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `parent_id`       BIGINT NOT NULL DEFAULT 0 COMMENT '父分类 ID',
    `name`            VARCHAR(100) NOT NULL COMMENT '分类名称',
    `slug`            VARCHAR(100) NOT NULL COMMENT '分类别名',
    `level`           TINYINT NOT NULL DEFAULT 1 COMMENT '层级',
    `sort`            INT NOT NULL DEFAULT 0 COMMENT '排序',
    `icon`            VARCHAR(200) DEFAULT NULL COMMENT '图标',
    `status`          TINYINT NOT NULL DEFAULT 0 COMMENT '状态',
    `creator`         VARCHAR(64) DEFAULT '' COMMENT '创建者',
    `create_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`         VARCHAR(64) DEFAULT '' COMMENT '更新者',
    `update_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`         TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    `tenant_id`       BIGINT NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE KEY `uk_category_slug` (`slug`, `tenant_id`, `deleted`) USING BTREE,
    KEY `idx_category_parent` (`parent_id`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '分类表';

-- Offer 表
DROP TABLE IF EXISTS `river_affiliate_offer`;
CREATE TABLE `river_affiliate_offer` (
    `id`                      BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `merchant_id`             BIGINT NOT NULL COMMENT '商家 ID',
    `network_id`              BIGINT NOT NULL COMMENT '联盟网络 ID',
    `external_id`             VARCHAR(100) DEFAULT NULL COMMENT '联盟侧 Offer ID',
    `name`                    VARCHAR(300) NOT NULL COMMENT 'Offer 名称',
    `description`             LONGTEXT COMMENT 'Offer 描述',
    `commission_type`         TINYINT NOT NULL DEFAULT 1 COMMENT '佣金类型',
    `commission_value`        DECIMAL(10,4) NOT NULL DEFAULT 0 COMMENT '佣金数值',
    `currency`                VARCHAR(10) NOT NULL DEFAULT 'USD' COMMENT '佣金货币',
    `cookie_days`             INT DEFAULT 30 COMMENT 'Cookie 有效期（天）',
    `goto_url`                LONGTEXT COMMENT '追踪跳转URL',
    `landing_url`             VARCHAR(1000) DEFAULT NULL COMMENT '落地页 URL',
    `status`                  TINYINT NOT NULL DEFAULT 0 COMMENT '状态',
    `regions`                 LONGTEXT COMMENT '支持地区',
    `category_ids`            LONGTEXT COMMENT '分类 ID 列表',
    `tags`                    LONGTEXT COMMENT '标签',
    `image_url`               VARCHAR(500) DEFAULT NULL COMMENT '图片 URL',
    `epc`                     DECIMAL(10,4) DEFAULT NULL COMMENT 'EPC（每次点击收益）',
    `conversion_rate`         DECIMAL(5,4) DEFAULT NULL COMMENT '转化率',
    `featured`                TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否编辑推荐',
    `hot_score`               INT NOT NULL DEFAULT 0 COMMENT '热度分数',
    `creator`                 VARCHAR(64) DEFAULT '' COMMENT '创建者',
    `create_time`             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`                 VARCHAR(64) DEFAULT '' COMMENT '更新者',
    `update_time`             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`                 TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    `tenant_id`               BIGINT NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE KEY `uk_offer_external` (`network_id`, `external_id`, `tenant_id`, `deleted`) USING BTREE,
    KEY `idx_offer_merchant` (`merchant_id`) USING BTREE,
    KEY `idx_offer_network` (`network_id`) USING BTREE,
    KEY `idx_offer_status` (`status`) USING BTREE,
    KEY `idx_offer_featured` (`featured`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Offer/广告表';

SET FOREIGN_KEY_CHECKS = 1;
