-- =============================================
-- Rakuten Advertising 联盟网络数据初始化
-- =============================================

SET NAMES utf8mb4;

-- 插入 Rakuten 联盟网络记录
INSERT INTO `river_affiliate_network` (
    `code`, `name`, `type`, `api_base_url`, `status`,
    `website_url`, `logo_url`, `description`, `remark`,
    `creator`, `create_time`, `updater`, `update_time`, `deleted`, `tenant_id`
) VALUES (
    'rakuten', 'Rakuten Advertising', 1, 'https://api.rakutenadvertising.com', 1,
    'https://rakutenadvertising.com',
    'https://rakutenadvertising.com/wp-content/uploads/2020/08/rakuten-advertising-logo.png',
    'Rakuten Advertising (formerly LinkShare) CPS Affiliate Network - 全球领先的联盟营销平台',
    '凭证格式: {"apiKey": "your-api-key", "publisherId": "optional"}',
    '1', NOW(), '1', NOW(), 0, 1
) ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
