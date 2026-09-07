-- 博客文章表新增 SEO 字段 meta_title 和 meta_description
-- 字段已在 Java/前端代码中定义，此处补充数据库迁移
ALTER TABLE `river_blog_post`
    ADD COLUMN `meta_title` VARCHAR(200) DEFAULT NULL COMMENT 'SEO 标题（为空回退 title）' AFTER `published_at`,
    ADD COLUMN `meta_description` VARCHAR(500) DEFAULT NULL COMMENT 'SEO 描述（为空回退 excerpt）' AFTER `meta_title`;
