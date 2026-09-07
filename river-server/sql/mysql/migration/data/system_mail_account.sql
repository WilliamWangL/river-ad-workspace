SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO `system_mail_account` (`id`, `mail`, `username`, `password`, `host`, `port`, `ssl_enable`, `starttls_enable`, `creator`, `create_time`, `updater`, `update_time`, `deleted`) VALUES
(1, '7684413@qq.com', '7684413@qq.com', '1234576', '127.0.0.1', '8080', 0, 0, 1, '2023-01-25 17:39:52', 1, '2025-04-04 16:34:40', 0),
('2', 'ydym_test@163.com', 'ydym_test@163.com', 'WBZTEINMIFVRYSOE', 'smtp.163.com', '465', 1, 0, 1, '2023-01-26 01:26:03', 1, '2025-07-26 21:57:55', 0),
('3', '76854114@qq.com', '3335', '11234', 'yunai1.cn', '466', 0, 0, 1, '2023-01-27 15:06:38', 1, '2023-01-27 07:08:36', 1),
('4', '7685413x@qq.com', '2', '3', '4', '5', 1, 0, 1, '2023-04-12 23:05:06', 1, '2023-04-12 15:05:11', 1);

