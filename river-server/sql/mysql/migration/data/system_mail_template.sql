SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO `system_mail_template` (`id`, `name`, `code`, `account_id`, `nickname`, `title`, `content`, `params`, `status`, `remark`, `creator`, `create_time`, `updater`, `update_time`, `deleted`) VALUES
('13', '后台用户短信登录', 'admin-sms-login', 1, '奥特曼', '你猜我猜', '<p>您的验证码是{code}，名字是{name}</p>', '["code","name"]', 0, '3', 1, '2021-10-11 08:10:00', 1, '2023-12-02 19:51:14', 0),
('14', '测试模版', 'test_01', '2', '芋艿', '一个标题', '<p>你是 {key01} 吗？</p><p><br></p><p>是的话，赶紧 {key02} 一下！</p>', '["key01","key02"]', 0, NULL, 1, '2023-01-26 01:27:40', 1, '2025-07-26 21:48:45', 0),
('15', '3', '2', '2', '7', '4', '<p>45</p>', '[]', 1, '80', 1, '2023-01-27 15:50:35', 1, '2025-07-26 21:47:49', 1);

