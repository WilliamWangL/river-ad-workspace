-- 点击追踪表新增 goto_url 字段，记录实际跳转使用的 URL

ALTER TABLE `river_tracking_click`
    ADD COLUMN `goto_url` LONGTEXT COMMENT '实际跳转使用的 gotoUrl' AFTER `deal_id`;
