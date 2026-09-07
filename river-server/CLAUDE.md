# CLAUDE.md - River Server

后端 API 服务，基于 Spring Boot 3.5 + Java 17 + MySQL 8.0。

## 常用命令

```bash
# 编译整个项目
mvn clean compile

# 编译单个模块
cd river-module-{module} && mvn clean compile

# 运行服务器（默认端口 48080）
cd river-server && mvn spring-boot:run

# 跳过测试打包
mvn clean package -DskipTests

# 运行测试
mvn test -Dtest=TestClassName              # 单个测试类
mvn test -Dtest=TestClassName#methodName   # 单个测试方法
```

## 模块架构

```
river-server/
├── river-framework/           # 技术组件（基础框架，禁止修改）
├── river-server/              # 主启动模块
├── river-dependencies/        # 依赖管理 BOM
├── river-module-system/       # 系统模块（禁止修改）
├── river-module-infra/        # 基础设施模块（禁止修改）
├── river-module-affiliate/    # 联盟营销模块
├── river-module-tracking/     # 跟踪追踪模块
├── river-module-coupon/       # 优惠券模块
├── river-module-blog/         # 博客模块
├── river-module-campaign/     # 营销活动模块
└── river-module-stats/        # 统计模块
```

### 业务模块结构

```
river-module-{name}/
└── src/main/java/com/river/module/{name}/
    ├── api/                # 跨模块 API 接口
    ├── controller/         # REST Controller
    │   ├── admin/          # 管理后台接口（/admin-api/）
    │   └── app/            # 公开接口（/app-api/）
    ├── dal/                # 数据访问层
    │   ├── dataobject/     # DO (数据库实体)
    │   └── mysql/          # MyBatis Mapper
    ├── enums/              # 枚举定义
    ├── framework/          # 模块级配置
    └── service/            # 业务逻辑层
```

## 代码规范

### 命名约定

| 类型 | 命名规则 | 示例 |
|------|----------|------|
| DO | `{Entity}DO` | `MerchantDO`, `CouponDO` |
| VO | `{Entity}{Action}RespVO` / `{Entity}{Action}ReqVO` | `MerchantRespVO`, `MerchantCreateReqVO` |
| Service 接口 | `{Entity}Service` | `MerchantService` |
| Service 实现 | `{Entity}ServiceImpl` | `MerchantServiceImpl` |
| Mapper | `{Entity}Mapper` | `MerchantMapper` |
| Controller | `{Entity}Controller` | `MerchantController` |

### 对象转换

使用 `BeanUtils` 进行对象转换，禁止使用 MapStruct Convert：

| 场景 | 方法 |
|------|------|
| 单对象转换 | `BeanUtils.toBean(source, TargetClass.class)` |
| 列表转换 | `BeanUtils.toBean(list, TargetClass.class)` |
| 分页转换 | `BeanUtils.toBean(pageResult, TargetClass.class)` |
| 带自定义处理 | `BeanUtils.toBean(source, TargetClass.class, vo -> { ... })` |

### API 设计规范

| 操作 | HTTP 方法 | 路径模式 | 方法命名 | 权限命名 |
|------|-----------|----------|----------|----------|
| 创建 | POST | `/create` | `create{Entity}` | `{module}:{entity}:create` |
| 更新 | PUT | `/update` | `update{Entity}` | `{module}:{entity}:update` |
| 删除 | DELETE | `/delete` | `delete{Entity}` | `{module}:{entity}:delete` |
| 查询单个 | GET | `/get` | `get{Entity}` | `{module}:{entity}:query` |
| 查询列表 | GET | `/list` | `get{Entity}List` | `{module}:{entity}:query` |
| 分页查询 | GET | `/page` | `get{Entity}Page` | `{module}:{entity}:query` |
| 导出 | GET | `/export-excel` | `export{Entity}Excel` | `{module}:{entity}:export` |

**路径前缀**：
- `/admin-api/{module}/{entity}/` — 管理后台接口（需认证）
- `/app-api/{module}/{entity}/` — 公开接口（部分需 `@PermitAll`）

### 错误处理规范

**错误码分段**（模块内自行分配，避免冲突）：

| 模块 | 错误码范围 |
|------|------------|
| system | 1-001-000-000 ~ 1-001-999-999 |
| infra | 1-002-000-000 ~ 1-002-999-999 |
| affiliate | 1-010-000-000 ~ 1-010-999-999 |
| tracking | 1-011-000-000 ~ 1-011-999-999 |
| coupon | 1-012-000-000 ~ 1-012-999-999 |
| blog | 1-013-000-000 ~ 1-013-999-999 |
| campaign | 1-014-000-000 ~ 1-014-999-999 |
| stats | 1-015-000-000 ~ 1-015-999-999 |

**异常抛出**：

```java
// 业务异常使用 ServiceException
throw exception(MERCHANT_NOT_EXISTS);

// ErrorCode 定义在模块的 enums/ErrorCodeConstants.java
ErrorCode MERCHANT_NOT_EXISTS = new ErrorCode(1_010_001_000, "商家不存在");
```

## 数据库规范

### 表结构约定

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | int8 | 是 | 主键（雪花算法） |
| creator | varchar(64) | 否 | 创建人 |
| create_time | timestamp | 是 | 创建时间 |
| updater | varchar(64) | 否 | 更新人 |
| update_time | timestamp | 是 | 更新时间 |
| deleted | int2 | 是 | 软删除标记（0=未删除，1=已删除） |
| tenant_id | int8 | 是 | 租户 ID（业务表必填） |

**表前缀**：
- 新业务模块：`river_`
- 框架表：`system_`、`infra_`

**索引命名**：
- 唯一索引：`uk_{table}_{column}`
- 普通索引：`idx_{table}_{column}`

### 标准表结构示例

```sql
CREATE TABLE river_example (
    id int8 NOT NULL,
    name varchar(200) NOT NULL,
    status int2 NOT NULL DEFAULT 0,
    creator varchar(64) DEFAULT '',
    create_time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updater varchar(64) DEFAULT '',
    update_time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted int2 NOT NULL DEFAULT 0,
    tenant_id int8 NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
```

## 配置文件

| 文件 | 说明 |
|------|------|
| `application.yaml` | 主配置 |
| `application-local.yaml` | 本地开发环境（默认激活） |
| `application-dev.yaml` | 开发服务器环境 |

## 测试规范

- 单元测试使用 Spring Boot Test
- 测试配置文件：`application-unit-test.yaml`
- Mapper 测试需 `@SqlTest` 注解
- TDD 流程：先写测试 → 看失败 → 再实现

## 重要注意事项

1. **遵循现有模式** — 创建新代码前先查看类似模块（如 river-module-affiliate）
2. **TDD 流程** — 先写测试 → 看失败 → 再实现
3. **未明确要求不得 commit** — 不要主动创建 Git 提交
4. **软删除** — 禁止硬删除，使用 `deleted` 字段
5. **多租户** — 业务表必须包含 `tenant_id` 字段
6. **禁止修改基础平台** — river-framework、river-module-system、river-module-infra 未经用户明确要求不得修改
