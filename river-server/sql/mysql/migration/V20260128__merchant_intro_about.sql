-- 商家表新增「商家简介 intro」「商家描述 about」字段
-- 前者用于详情页头部摘要，后者用于详情页底部富文本；均为空时回退到 description
ALTER TABLE `river_affiliate_merchant`
    ADD COLUMN `intro` LONGTEXT COMMENT '商家简介（短文本，为空回退 description）' AFTER `description`,
    ADD COLUMN `about` LONGTEXT COMMENT '商家描述（长富文本，为空回退 description）' AFTER `intro`;
