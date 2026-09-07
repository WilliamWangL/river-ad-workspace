-- Deal 表新增 source_url 字段，记录爬虫采集来源页面 URL
-- 用于去重和溯源追踪

ALTER TABLE `river_coupon_deal`
    ADD COLUMN `source_url` VARCHAR(1000) DEFAULT NULL COMMENT '爬虫采集来源页面 URL' AFTER `goto_url`;

-- 为 source_url + merchant_id 组合添加索引，用于爬虫去重查询
ALTER TABLE `river_coupon_deal`
    ADD KEY `idx_deal_source_url_merchant` (`source_url`(255), `merchant_id`) USING BTREE;

-- 商家表新增 crawl_enabled 字段，控制是否对该商家执行爬虫采集
-- 默认 0（不爬取），需管理员手动开启
ALTER TABLE `river_affiliate_merchant`
    ADD COLUMN `crawl_enabled` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否启用爬虫采集（0=不爬取，1=爬取）' AFTER `status`;

-- Deal 表新增 image_urls 字段，存储详情页多张商品图片
ALTER TABLE `river_coupon_deal`
    ADD COLUMN `image_urls` LONGTEXT DEFAULT NULL COMMENT '商品图片 URL 列表（JSON 数组，详情页多图）' AFTER `image_url`;
