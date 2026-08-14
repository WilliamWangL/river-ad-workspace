# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

River 广告平台是一个广告联盟管理系统 monorepo，包含三个子项目：

| 项目 | 技术栈 | 说明 |
|------|--------|------|
| **river-server** | Java 17 + Spring Boot 3.5 + MySQL 8.0 | 后端 API 服务 |
| **river-ui-admin** | Vue 3 + Element Plus + TypeScript + Vite 5 | 管理后台 |
| **river-ecommica** | Next.js 16 + React 19 + Tailwind CSS 4 | 优惠聚合站点 (deals.ecommica.com) |

## 子项目文档

详细开发规范请查阅各子项目文档：

| 子项目 | 文档路径 | 主要内容 |
|--------|----------|----------|
| river-server | `river-server/CLAUDE.md` | 后端架构、代码规范、API 设计、数据库规范 |
| river-ui-admin | `river-ui-admin/CLAUDE.md` | 前端架构、组件规范、API 调用模式 |
| river-ecommica | `river-ecommica/CLAUDE.md` | Next.js 架构、国际化、SEO 规范 |

## 基础平台能力

> **重要**：优先复用框架工具类和基础服务，禁止重复造轮子。

### river-framework 模块

| 模块 | 功能 |
|------|------|
| river-common | 工具类、枚举、常量、跨模块 API 接口 |
| river-spring-boot-starter-mybatis | MyBatis Plus 扩展、分页、多租户 |
| river-spring-boot-starter-redis | Redis/Redisson 缓存、分布式锁 |
| river-spring-boot-starter-web | 全局异常处理、访问日志、XSS 过滤 |
| river-spring-boot-starter-security | OAuth2 认证、权限校验 |
| river-spring-boot-starter-biz-tenant | 多租户支持 |
| river-spring-boot-starter-biz-data-permission | 数据权限 |
| river-spring-boot-starter-biz-ip | IP 地理位置解析 |
| river-spring-boot-starter-excel | Excel 导入导出 |
| river-spring-boot-starter-job | 定时任务 |
| river-spring-boot-starter-mq | 消息队列 |
| river-spring-boot-starter-protection | 限流、幂等、分布式锁 |
| river-spring-boot-starter-websocket | WebSocket 支持 |
| river-spring-boot-starter-monitor | 监控 |

### river-common 工具类

| 工具类 | 用途 |
|--------|------|
| CollectionUtils | 集合操作（转换、过滤、分组） |
| DateUtils / LocalDateTimeUtils | 日期时间处理 |
| JsonUtils | JSON 序列化/反序列化 |
| StrUtils | 字符串处理 |
| BeanUtils | 对象拷贝、属性操作 |
| NumberUtils / MoneyUtils | 数字和金额处理 |
| FileUtils / IoUtils | 文件和 IO 操作 |
| HttpUtils | HTTP 请求 |
| ValidationUtils | 参数校验 |
| SpringUtils | Spring 上下文工具 |

### 基础服务（直接调用，勿重新实现）

**system 模块**：
- 用户管理（UserService）
- 角色权限（RoleService, PermissionService）
- 字典管理（DictDataService）— 枚举优先使用字典
- 租户管理（TenantService）
- 部门管理（DeptService）
- 通知消息（NotifyService, SmsService, MailService）
- 操作日志（OperateLogService）

**infra 模块**：
- 文件上传（FileService）
- 配置管理（ConfigService）
- 代码生成（CodegenService）
- 定时任务（JobService）

## Git 工作流

项目已安装 commit-commands 插件：

| 命令 | 说明 |
|------|------|
| `/commit` | 创建 Git 提交 |
| `/commit-push-pr` | 提交、推送并创建 PR |
| `/clean_gone` | 清理已删除的远程分支 |

## 开发工作流 (Superpowers)

| 阶段 | 技能 | 说明 |
|------|------|------|
| 设计 | `brainstorming` | 编写代码前激活，通过问题细化需求 |
| 规划 | `writing-plans` | 设计批准后，将工作拆分为小任务 |
| 开发 | `test-driven-development` | RED-GREEN-REFACTOR 流程 |
| 调试 | `systematic-debugging` | 4 阶段根因分析，禁止盲目尝试 |
| 审查 | `requesting-code-review` | 任务完成后审查代码 |

设计文档存放于 `docs/plans/` 目录，格式：`YYYY-MM-DD-{feature-name}.md`

## 通用约束

1. **遵循现有模式** — 创建新代码前先查看类似模块
2. **未明确要求不得 commit** — 不要主动创建 Git 提交
3. **软删除** — 禁止硬删除，使用 `deleted` 字段
4. **多租户** — 业务表必须包含 `tenant_id` 字段
5. **禁止修改基础平台** — 未经用户明确要求，不得修改 river-framework、river-module-system、river-module-infra
6. **禁止重复造轮子** — 优先使用 river-common 工具类和 system/infra 服务
7. **字典数据** — 枚举类型优先使用系统字典 API (`/system/dict-data/type/{dictType}`)
8. **API 路径一致** — 前端 API 路径与后端 Controller 路径保持一致
9. **禁止硬编码** — 禁止硬编码，使用常量、枚举等。
