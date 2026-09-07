-- =============================================
-- River 广告平台 - 权限配置 SQL (MySQL 8.0)
-- 添加 affiliate:network:sync 权限
-- 生成时间: 2026-01-23
-- =============================================

SET NAMES utf8mb4;

-- =============================================
-- 联盟网络同步权限 (affiliate:network:sync)
-- 父菜单: 联盟网络 (20011)
-- 类型: 按钮 (type=3)
-- =============================================

INSERT INTO `system_menu` (`id`, `name`, `permission`, `type`, `sort`, `parent_id`, `path`, `icon`, `component`, `component_name`, `status`, `visible`, `keep_alive`, `always_show`, `creator`, `create_time`, `updater`, `update_time`, `deleted`) VALUES (
    20016,
    '联盟网络同步',
    'affiliate:network:sync',
    3,
    5,
    20011,
    '',
    '',
    '',
    '',
    0,
    b'1',
    b'1',
    b'1',
    'admin',
    NOW(),
    'admin',
    NOW(),
    b'0'
);

-- =============================================
-- 联盟网络导出权限 (affiliate:network:export)
-- 父菜单: 联盟网络 (20011)
-- 类型: 按钮 (type=3)
-- =============================================

INSERT INTO `system_menu` (`id`, `name`, `permission`, `type`, `sort`, `parent_id`, `path`, `icon`, `component`, `component_name`, `status`, `visible`, `keep_alive`, `always_show`, `creator`, `create_time`, `updater`, `update_time`, `deleted`) VALUES (
    20017,
    '联盟网络导出',
    'affiliate:network:export',
    3,
    6,
    20011,
    '',
    '',
    '',
    '',
    0,
    b'1',
    b'1',
    b'1',
    'admin',
    NOW(),
    'admin',
    NOW(),
    b'0'
);

-- =============================================
-- 说明:
-- 1. 20016 - affiliate:network:sync 用于同步 Deal 和 Coupon 的按钮
-- 2. 20017 - affiliate:network:export 用于导出按钮（如果有的话）
--
-- 执行方法:
-- 1. 连接到 MySQL 数据库
-- 2. 执行上述 SQL 语句
-- 3. 如果权限已存在（deleted=0），会报唯一键冲突错误
-- 4. 如果需要更新已删除的权限，先执行 UPDATE 设置 deleted=0
--
-- 分配权限:
-- 1. 进入「系统管理」- 「角色管理」
-- 2. 编辑需要同步权限的角色
-- 3. 在「菜单权限」中勾选「联盟网络同步」
-- 4. 保存后该角色的用户即可使用同步功能
-- =============================================
