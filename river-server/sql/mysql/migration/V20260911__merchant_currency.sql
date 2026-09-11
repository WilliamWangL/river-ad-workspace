-- 商家表新增货币字段，用于 deal/coupon 价格显示时根据商家显示对应货币符号
ALTER TABLE `river_affiliate_merchant`
  ADD COLUMN `currency` varchar(3) NOT NULL DEFAULT 'USD' COMMENT '货币代码（ISO 4217，如 USD、EUR、GBP、CNY、RUB）' AFTER `rating`;
