-- =====================================================
-- 分类表添加 region 字段
-- 支持按地区区分分类，找不到时回退默认地区 '00'
-- =====================================================

-- 1. 添加 region 字段
ALTER TABLE `river_affiliate_category`
ADD COLUMN `region` VARCHAR(10) NOT NULL DEFAULT '00' COMMENT '地区代码，如 US、RU、00 表示默认' AFTER `icon`;

-- 2. 创建索引：按地区查询分类
CREATE INDEX `idx_category_region` ON `river_affiliate_category`(`region`);

-- 3. 设置现有数据的 region
-- 俄语分类（名称包含 Cyrillic 字母）→ 'RU'
UPDATE `river_affiliate_category`
SET `region` = 'RU'
WHERE `name` REGEXP '[а-яА-ЯёЁ]'
  AND `deleted` = 0;

-- 英语分类保持默认 '00'（已通过 DEFAULT '00' 设置）
