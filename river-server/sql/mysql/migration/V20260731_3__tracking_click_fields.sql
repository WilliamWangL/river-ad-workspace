-- 点击追踪表新增 merchant_name、coupon_id、deal_id 字段
-- 追踪链接表新增 merchant_id 字段（便于点击记录时冗余商家信息）

ALTER TABLE `river_tracking_click`
    ADD COLUMN `merchant_name` VARCHAR(200) DEFAULT NULL COMMENT '商家名称（冗余字段，便于展示）' AFTER `merchant_id`,
    ADD COLUMN `coupon_id` BIGINT DEFAULT NULL COMMENT '优惠券 ID（冗余字段，targetType=4 时填充）' AFTER `merchant_name`,
    ADD COLUMN `deal_id` BIGINT DEFAULT NULL COMMENT 'Deal ID（冗余字段，targetType=3 时填充）' AFTER `coupon_id`;

ALTER TABLE `river_tracking_link`
    ADD COLUMN `merchant_id` BIGINT DEFAULT NULL COMMENT '商家 ID（冗余字段，便于点击记录填充）' AFTER `target_id`;
