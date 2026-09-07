SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO `river_blog_author` (`id`, `name`, `slug`, `avatar_url`, `bio`, `status`, `creator`, `create_time`, `updater`, `update_time`, `deleted`, `tenant_id`) VALUES
('2', '李四', 'li-si', 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi', 'AI 领域专家，专注于大模型应用', 0, 'system', '2026-01-20 00:55:32.565913', 'system', '2026-01-20 00:55:32.565913', 0, 1),
(1, 'xiaoheshi', 'xiaoheshi', 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan', '全栈开发者，热爱开源技术', 0, 'system', '2026-01-20 00:55:32.565913', 1, '2026-01-28 13:16:21.058858', 0, 1);

