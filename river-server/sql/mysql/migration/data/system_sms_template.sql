SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO `system_sms_template` (`id`, `type`, `status`, `code`, `name`, `content`, `params`, `remark`, `api_template_id`, `channel_id`, `channel_code`, `creator`, `create_time`, `updater`, `update_time`, `deleted`) VALUES
('2', 1, 0, 'test_01', '测试验证码短信', '正在进行登录操作{operation}，您的验证码是{code}', '["operation","code"]', '测试备注', '4383920', '4', 'DEBUG_DING_TALK', '', '2021-03-31 10:49:38', 1, '2024-08-18 11:57:18', 0),
('3', 1, 0, 'test_02', '公告通知', '您的验证码{code}，该验证码5分钟内有效，请勿泄漏于他人！', '["code"]', NULL, 'SMS_207945135', '2', 'ALIYUN', '', '2021-03-31 11:56:30', 1, '2021-04-10 01:22:02', 0),
('6', '3', 0, 'test-01', '测试模板', '哈哈哈 {name}', '["name"]', 'f哈哈哈', '4383920', '4', 'DEBUG_DING_TALK', 1, '2021-04-10 01:07:21', 1, '2024-08-18 11:57:07', 0),
('7', '3', 0, 'test-04', '测试下', '老鸡{name}，牛逼{code}', '["name","code"]', '哈哈哈哈', 'suibian', '7', 'DEBUG_DING_TALK', 1, '2021-04-13 00:29:53', 1, '2024-09-30 00:56:24', 0),
('8', 1, 0, 'user-sms-login', '前台用户短信登录', '您的验证码是{code}', '["code"]', NULL, '4372216', '4', 'DEBUG_DING_TALK', 1, '2021-10-11 08:10:00', 1, '2024-08-18 11:57:06', 0),
('9', '2', 0, 'bpm_task_assigned', '【工作流】任务被分配', '您收到了一条新的待办任务：{processInstanceName}-{taskName}，申请人：{startUserNickname}，处理链接：{detailUrl}', '["processInstanceName","taskName","startUserNickname","detailUrl"]', NULL, 'suibian', '4', 'DEBUG_DING_TALK', 1, '2022-01-21 22:31:19', 1, '2022-01-22 00:03:36', 0),
('10', '2', 0, 'bpm_process_instance_reject', '【工作流】流程被不通过', '您的流程被审批不通过：{processInstanceName}，原因：{reason}，查看链接：{detailUrl}', '["processInstanceName","reason","detailUrl"]', NULL, 'suibian', '4', 'DEBUG_DING_TALK', 1, '2022-01-22 00:03:31', 1, '2022-05-01 12:33:14', 0),
('11', '2', 0, 'bpm_process_instance_approve', '【工作流】流程被通过', '您的流程被审批通过：{processInstanceName}，查看链接：{detailUrl}', '["processInstanceName","detailUrl"]', NULL, 'suibian', '4', 'DEBUG_DING_TALK', 1, '2022-01-22 00:04:31', 1, '2022-03-27 20:32:21', 0),
('12', '2', 0, 'demo', '演示模板', '我就是测试一下下', '[]', NULL, 'biubiubiu', '4', 'DEBUG_DING_TALK', 1, '2022-04-10 23:22:49', 1, '2024-08-18 11:57:04', 0),
('14', 1, 0, 'user-update-mobile', '会员用户 - 修改手机', '您的验证码{code}，该验证码 5 分钟内有效，请勿泄漏于他人！', '["code"]', '', 'null', '4', 'DEBUG_DING_TALK', 1, '2023-08-19 18:58:01', 1, '2023-08-19 11:34:04', 0),
('15', 1, 0, 'user-update-password', '会员用户 - 修改密码', '您的验证码{code}，该验证码 5 分钟内有效，请勿泄漏于他人！', '["code"]', '', 'null', '4', 'DEBUG_DING_TALK', 1, '2023-08-19 18:58:01', 1, '2023-08-19 11:34:18', 0),
('16', 1, 0, 'user-reset-password', '会员用户 - 重置密码', '您的验证码{code}，该验证码 5 分钟内有效，请勿泄漏于他人！', '["code"]', '', 'null', '4', 'DEBUG_DING_TALK', 1, '2023-08-19 18:58:01', 1, '2023-12-02 22:35:27', 0),
('17', '2', 0, 'bpm_task_timeout', '【工作流】任务审批超时', '您收到了一条超时的待办任务：{processInstanceName}-{taskName}，处理链接：{detailUrl}', '["processInstanceName","taskName","detailUrl"]', '', 'X', '4', 'DEBUG_DING_TALK', 1, '2024-08-16 21:59:15', 1, '2024-08-16 21:59:34', 0),
('18', 1, 0, 'admin-reset-password', '后台用户 - 忘记密码', '您的验证码{code}，该验证码 5 分钟内有效，请勿泄漏于他人！', '["code"]', '', 'null', '4', 'DEBUG_DING_TALK', 1, '2025-03-16 14:19:34', 1, '2025-03-16 14:19:45', 0),
('19', 1, 0, 'admin-sms-login', '后台用户短信登录', '您的验证码是{code}', '["code"]', '', '4372216', '4', 'DEBUG_DING_TALK', 1, '2025-04-08 09:36:03', 1, '2025-04-08 09:36:17', 0);

