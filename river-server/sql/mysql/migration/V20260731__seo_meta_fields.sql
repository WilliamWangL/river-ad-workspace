-- 商家、Coupon、Deal 表新增 SEO 字段 meta_title 和 meta_description
-- meta_title: SEO 页面标题，为空时回退到原有标题字段（商家 name、Deal title、Coupon title）
-- meta_description: SEO meta 描述，为空时回退到原有描述字段

ALTER TABLE `river_affiliate_merchant`
    ADD COLUMN `meta_title` VARCHAR(255) DEFAULT NULL COMMENT 'SEO 页面标题（为空回退 name）' AFTER `about`,
    ADD COLUMN `meta_description` TEXT COMMENT 'SEO meta 描述（为空回退 intro/description）' AFTER `meta_title`;

ALTER TABLE `river_coupon_deal`
    ADD COLUMN `meta_title` VARCHAR(255) DEFAULT NULL COMMENT 'SEO 页面标题（为空回退 title）' AFTER `description`,
    ADD COLUMN `meta_description` TEXT COMMENT 'SEO meta 描述（为空回退 description）' AFTER `meta_title`;

ALTER TABLE `river_coupon_coupon`
    ADD COLUMN `meta_title` VARCHAR(255) DEFAULT NULL COMMENT 'SEO 页面标题（为空回退 title）' AFTER `code`,
    ADD COLUMN `meta_description` TEXT COMMENT 'SEO meta 描述（为空回退 terms/description）' AFTER `meta_title`;
