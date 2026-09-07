-- =============================================
-- River Blog Module - MySQL 8.0 Schema
-- =============================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 作者表
DROP TABLE IF EXISTS `river_blog_author`;
CREATE TABLE `river_blog_author` (
    `id`              BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `name`            VARCHAR(100) NOT NULL COMMENT '作者名称',
    `slug`            VARCHAR(100) NOT NULL COMMENT '作者别名',
    `avatar_url`      VARCHAR(500) DEFAULT NULL COMMENT '头像 URL',
    `bio`             LONGTEXT COMMENT '作者简介',
    `status`          TINYINT NOT NULL DEFAULT 0 COMMENT '状态',
    `creator`         VARCHAR(64) DEFAULT '' COMMENT '创建者',
    `create_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`         VARCHAR(64) DEFAULT '' COMMENT '更新者',
    `update_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`         TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    `tenant_id`       BIGINT NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE KEY `uk_blog_author_slug` (`slug`, `tenant_id`, `deleted`) USING BTREE,
    KEY `idx_blog_author_status` (`status`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '博客作者表';

-- 标签表
DROP TABLE IF EXISTS `river_blog_tag`;
CREATE TABLE `river_blog_tag` (
    `id`              BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `name`            VARCHAR(100) NOT NULL COMMENT '标签名称',
    `slug`            VARCHAR(100) NOT NULL COMMENT '标签别名',
    `post_count`      INT NOT NULL DEFAULT 0 COMMENT '文章数量',
    `status`          TINYINT NOT NULL DEFAULT 0 COMMENT '状态',
    `creator`         VARCHAR(64) DEFAULT '' COMMENT '创建者',
    `create_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`         VARCHAR(64) DEFAULT '' COMMENT '更新者',
    `update_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`         TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    `tenant_id`       BIGINT NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE KEY `uk_blog_tag_slug` (`slug`, `tenant_id`, `deleted`) USING BTREE,
    KEY `idx_blog_tag_status` (`status`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '博客标签表';

-- 文章表
DROP TABLE IF EXISTS `river_blog_post`;
CREATE TABLE `river_blog_post` (
    `id`                  BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `author_id`           BIGINT NOT NULL COMMENT '作者 ID',
    `title`               VARCHAR(300) NOT NULL COMMENT '文章标题',
    `slug`                VARCHAR(300) NOT NULL COMMENT '文章别名',
    `content`             LONGTEXT COMMENT '文章内容',
    `excerpt`             LONGTEXT COMMENT '文章摘要',
    `cover_image`         VARCHAR(500) DEFAULT NULL COMMENT '封面图 URL',
    `type`                TINYINT NOT NULL DEFAULT 1 COMMENT '文章类型',
    `status`              TINYINT NOT NULL DEFAULT 0 COMMENT '文章状态',
    `published_at`        DATETIME DEFAULT NULL COMMENT '发布时间',
    `meta_title`          VARCHAR(200) DEFAULT NULL COMMENT 'SEO 标题',
    `meta_description`    VARCHAR(500) DEFAULT NULL COMMENT 'SEO 描述',
    `canonical_url`       VARCHAR(500) DEFAULT NULL COMMENT '规范链接',
    `view_count`          INT NOT NULL DEFAULT 0 COMMENT '浏览次数',
    `featured`            TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否推荐',
    `creator`             VARCHAR(64) DEFAULT '' COMMENT '创建者',
    `create_time`         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`             VARCHAR(64) DEFAULT '' COMMENT '更新者',
    `update_time`         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`             TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    `tenant_id`           BIGINT NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE KEY `uk_blog_post_slug` (`slug`, `tenant_id`, `deleted`) USING BTREE,
    KEY `idx_blog_post_author` (`author_id`) USING BTREE,
    KEY `idx_blog_post_type` (`type`) USING BTREE,
    KEY `idx_blog_post_status` (`status`) USING BTREE,
    KEY `idx_blog_post_featured` (`featured`) USING BTREE,
    KEY `idx_blog_post_published_at` (`published_at`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '博客文章表';

-- 文章标签关联表
DROP TABLE IF EXISTS `river_blog_post_tag`;
CREATE TABLE `river_blog_post_tag` (
    `id`              BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `post_id`         BIGINT NOT NULL COMMENT '文章 ID',
    `tag_id`          BIGINT NOT NULL COMMENT '标签 ID',
    `creator`         VARCHAR(64) DEFAULT '' COMMENT '创建者',
    `create_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`         VARCHAR(64) DEFAULT '' COMMENT '更新者',
    `update_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`         TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    `tenant_id`       BIGINT NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE KEY `uk_blog_post_tag` (`post_id`, `tag_id`, `tenant_id`, `deleted`) USING BTREE,
    KEY `idx_blog_post_tag_post` (`post_id`) USING BTREE,
    KEY `idx_blog_post_tag_tag` (`tag_id`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '文章标签关联表';

-- 文章Offer关联表
DROP TABLE IF EXISTS `river_blog_post_offer`;
CREATE TABLE `river_blog_post_offer` (
    `id`              BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `post_id`         BIGINT NOT NULL COMMENT '文章 ID',
    `offer_id`        BIGINT NOT NULL COMMENT 'Offer ID',
    `anchor_text`     VARCHAR(200) DEFAULT NULL COMMENT '锚文本',
    `position`        INT NOT NULL DEFAULT 0 COMMENT '位置',
    `creator`         VARCHAR(64) DEFAULT '' COMMENT '创建者',
    `create_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`         VARCHAR(64) DEFAULT '' COMMENT '更新者',
    `update_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`         TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    `tenant_id`       BIGINT NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`id`) USING BTREE,
    KEY `idx_blog_post_offer_post` (`post_id`) USING BTREE,
    KEY `idx_blog_post_offer_offer` (`offer_id`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '文章Offer关联表';

SET FOREIGN_KEY_CHECKS = 1;
