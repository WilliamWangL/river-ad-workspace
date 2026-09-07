SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO `infra_config` (`id`, `category`, `type`, `name`, `config_key`, `value`, `visible`, `remark`, `creator`, `create_time`, `updater`, `update_time`, `deleted`) VALUES
('2', 'biz', 1, '用户管理-账号初始密码', 'system.user.init-password', '123456', 0, '初始化密码 123456', 'admin', '2021-01-05 17:03:48', 1, '2024-07-20 17:22:47', 0),
('7', 'url', '2', 'MySQL 监控的地址', 'url.druid', '', 1, '', 1, '2023-04-07 13:41:16', 1, '2023-04-07 14:33:38', 0),
('8', 'url', '2', 'SkyWalking 监控的地址', 'url.skywalking', '', 1, '', 1, '2023-04-07 13:41:16', 1, '2023-04-07 14:57:03', 0),
('9', 'url', '2', 'Spring Boot Admin 监控的地址', 'url.spring-boot-admin', '', 1, '', 1, '2023-04-07 13:41:16', 1, '2023-04-07 14:52:07', 0),
('10', 'url', '2', 'Swagger 接口文档的地址', 'url.swagger', '', 1, '', 1, '2023-04-07 13:41:16', 1, '2023-04-07 14:59:00', 0),
('11', 'ui', '2', '腾讯地图 key', 'tencent.lbs.key', 'TVDBZ-TDILD-4ON4B-PFDZA-RNLKH-VVF6E', 1, '腾讯地图 key', 1, '2023-06-03 19:16:27', 1, '2023-06-03 19:16:27', 0),
('12', 'test2', '2', 'test3', 'test4', 'test5', 1, 'test6', 1, '2023-12-03 09:55:16', 1, '2025-04-06 21:00:09', 0),
('13', '用户管理-账号初始密码', '2', '用户管理-注册开关', 'system.user.register-enabled', 1, 0, '', 1, '2025-04-26 17:23:41', 1, '2025-04-26 17:23:41', 0);

