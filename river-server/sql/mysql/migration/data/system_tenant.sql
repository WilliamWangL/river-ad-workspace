SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO `system_tenant` (`id`, `name`, `contact_user_id`, `contact_name`, `contact_mobile`, `status`, `websites`, `package_id`, `expire_time`, `account_count`, `creator`, `create_time`, `updater`, `update_time`, `deleted`) VALUES
(1, '芋道源码', NULL, '芋艿', '17321315478', 0, 'www.iocoder.cn,127.0.0.1:3000,wxc4598c446f8a9cb3', 0, '2099-02-19 17:14:16', '9999', 1, '2021-01-05 17:03:47', 1, '2025-08-19 05:18:41', 0),
('121', '小租户', '110', '小王2', '15601691300', 0, 'zsxq.iocoder.cn,123321', '111', '2026-07-10 00:00:00', '30', 1, '2022-02-22 00:56:14', 1, '2025-08-19 21:19:29', 0),
('122', '测试租户', '113', '芋道', '15601691300', 0, 'test.iocoder.cn,222,333', '111', '2022-04-29 00:00:00', '50', 1, '2022-03-07 21:37:58', 1, '2025-09-06 20:44:42', 0);

