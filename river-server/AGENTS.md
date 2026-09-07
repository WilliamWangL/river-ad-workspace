# River Server - AI Agent 开发规范

> 本文档继承自 [项目通用规范](../AGENTS.md)。
> 
> 如未特别说明，遵循项目通用规范的所有约定。

## 特有规范

本文档记录后端子项目特有的开发规范。

### 框架 Starter 分类

> **避免硬编码**：使用分类模式描述，而非列出所有具体模块名。

| 分类 | 功能模式 | 依赖模式 | 继承关系 |
|------|----------|----------|----------|
| 基础设施 | 数据库访问 | starter-mybatis 类型 | 依赖 common |
| 基础设施 | 缓存操作 | starter-redis 类型 | 依赖 common |
| 基础设施 | Web 功能 | starter-web 类型 | 依赖 common |
| 安全认证 | 权限校验 | starter-security 类型 | 依赖 web |
| 服务保障 | 分布式锁 | starter-protection 类型 | 依赖 web + redis |
| 任务调度 | 定时/异步 | starter-job 类型 | 依赖 common |
| 消息通信 | 消息队列 | starter-mq 类型 | 依赖 redis |
| 业务增强 | 多租户/数据权限 | starter-biz-* 类型 | 依赖 security |

### 业务模块分类

| 分类 | 模式 | 说明 |
|------|------|------|
| 系统模块 | system 类型 | 用户、角色、菜单、权限 |
| 基础设施 | infra 类型 | 代码生成、配置、定时任务、文件 |
| 业务模块 | affiliate/tracking/coupon/blog/campaign/stats | 核心业务功能 |

### 禁止重复造轮子清单

> **避免硬编码**：按功能模式描述，而非列出具体类/注解名。

| 功能模式 | 框架提供 | 使用模式 |
|----------|----------|----------|
| 用户认证 | 是 | 认证 API 模式 |
| 权限校验 | 是 | 权限注解模式 |
| 全局异常 | 是 | 异常处理器模式 |
| API 日志 | 是 | 日志注解模式 |
| 数据脱敏 | 是 | 脱敏注解模式 |
| 错误码 | 是 | 错误码枚举模式 |
| 分布式锁 | 是 | 锁注解模式 |
| 幂等校验 | 是 | 幂等注解模式 |
| 限流 | 是 | 限流注解模式 |
| 数据源切换 | 是 | 数据源注解模式 |
| 租户隔离 | 是 | 租户注解模式 |
| 分页 | 是 | 分页结果模式 |

### 常用命令

#### MySQL 连接

**连接:** mysql -h localhost -P 3306 -u root -p river
**常用命令:** SHOW TABLES; DESC table_name; SELECT * FROM table_name LIMIT 10;
**数据库配置**（见 `application-local.yaml`）：
- URL: `jdbc:mysql://localhost:3306/river?useUnicode=true&characterEncoding=utf8mb4&serverTimezone=Asia/Shanghai&useSSL=false`
- 用户名/密码: `root` / `123456`

#### 后端服务
cd river-server

# 编译项目
mvn clean compile

# 运行所有测试
mvn test

# 运行单个测试类
mvn test -Dtest=ClassName

# 运行单个测试方法
mvn test -Dtest=ClassName#methodName

# 跳过测试打包
mvn clean package -DskipTests

# 运行服务器（默认端口 48080）
mvn spring-boot:run

# 仅编译某个模块
cd river-module-xxx && mvn clean compile
```

### 测试规范

#### 测试基类

| 基类 | 用途 |
|------|------|
| `BaseDbUnitTest` | 需要数据库的单元测试 |
| `BaseMockitoUnitTest` | 使用 Mockito 的纯单元测试 |
| `BaseRedisUnitTest` | 需要 Redis 的单元测试 |
| `BaseDbAndRedisUnitTest` | 需要数据库和 Redis 的测试 |

#### 测试类命名

- 命名规范：`{ServiceName}ImplTest.java`
- 位置：`src/test/java/` 目录

#### 测试示例

```java
public class ExampleServiceImplTest extends BaseDbUnitTest {

    @InjectMocks
    private ExampleServiceImpl service;

    @Mock
    private ExampleMapper mapper;

    @Test
    void testMethod() {
        // given
        // when
        // then
    }
}
```

### 代码风格

#### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 类名 | PascalCase | `UserServiceImpl` |
| 方法名/变量名 | camelCase | `getUserById` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 包名 | 全小写 | `com.river.module.affiliate` |

#### 导入顺序

1. 静态导入（import static）
2. JDK 包（java.*, javax.*）
3. Spring 包（org.springframework.*）
4. Lombok/其他库
5. 项目内部（com.river.*）

**禁止**：使用 `*` 通配符导入

#### 类注释

- 每个类必须添加类注释（DocComment）
- 字段注释使用 Javadoc `@param`、`@return`、`@see`

#### 类型安全（硬性禁止）

```java
// 禁止
as any
@ts-ignore
@ts-expect-error
catch(e) {}  // 空捕获块

// 必须
try {
    // 处理逻辑
} catch (SpecificException e) {
    // 记录或处理异常
}
```

#### 异常处理

- 使用 `ServiceException` 抛出业务异常
- 禁止吞掉异常而不处理
- 集成测试使用 `@SpringBootTest` + `@Transactional`

### 模块结构

```
river-module-xxx/
└── src/main/java/com/river/module/xxx/
    ├── api/           # 跨模块 API 接口（供其他模块调用）
    ├── controller/    # REST Controller
    │   ├── admin/     # 管理后台接口（/admin-api/）
    │   └── app/       # 公开接口（/app-api/，需 @PermitAll）
    ├── convert/       # MapStruct 转换器
    ├── dal/           # 数据访问层
    │   ├── dataobject/ # DO (数据库实体)
    │   └── mysql/     # MyBatis Mapper
    ├── enums/         # 枚举定义
    ├── framework/     # 模块级配置
    └── service/       # 业务逻辑层
```

### 重要约定

| 规则 | 说明 |
|------|------|
| API 路径 | `/admin-api/` 管理后台，`/app-api/` 公开接口 |
| 多租户 | 业务表必须包含 `tenant_id` 字段 |
| 软删除 | 使用 `deleted` 字段，禁止硬删除 |
| 表前缀 | 新模块 `river_`，框架 `system_`/`infra_` |

### 组件扫描

- `${river.info.base-package}.server`
- `${river.info.base-package}.module`
