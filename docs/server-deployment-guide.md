# River 广告平台 - 服务器部署手册

## 架构概览

```
                         ┌──────────────────┐
                         │    GitHub        │
                         │   Actions        │
                         └────────┬─────────┘
                                  │ 构建镜像 & SSH 部署
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                         腾讯云 CVM                               │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                      nginx (:80/:443)                   │   │
│   │                                                         │   │
│   │  /admin/*        → 静态文件 (Vue Admin)                  │   │
│   │  /admin-api/*    → river-server:48080                   │   │
│   │  /app-api/*      → river-server:48080                   │   │
│   │  /*              → river-ecommica:3000 (Next.js)        │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│   │ river-server │  │river-ecommica│  │ 静态文件 (admin-dist)│  │
│   │   :48080     │  │    :3000     │  │                      │  │
│   │  (Java 21)   │  │  (Next.js)   │  │    (Vue Admin)       │  │
│   └──────┬───────┘  └──────────────┘  └──────────────────────┘  │
│          │                                                      │
│   ┌──────┴───────┐  ┌──────────────┐                            │
│   │   postgres   │  │    redis     │                            │
│   │    :5432     │  │    :6379     │                            │
│   └──────────────┘  └──────────────┘                            │
│                                                                 │
│   数据目录: /opt/river/data/                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 一、服务器初始化

### 1.1 安装 Docker

**Ubuntu / Debian：**
```bash
curl -fsSL https://get.docker.com | sh
systemctl start docker
systemctl enable docker
```

**CentOS / OpenCloudOS / TencentOS：**
```bash
# 安装依赖
yum install -y yum-utils device-mapper-persistent-data lvm2

# 添加 Docker 仓库
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 安装 Docker
yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动并设置开机自启
systemctl start docker
systemctl enable docker
```

**验证安装：**
```bash
docker --version
```

### 1.2 安装 Docker Compose

```bash
# 下载 Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 添加执行权限
chmod +x /usr/local/bin/docker-compose

# 验证安装
docker-compose --version
```


### 1.3 创建部署目录

```bash
mkdir -p /opt/river/ssl
```

> 其他目录 (`nginx/`, `admin-dist/`, `data/`) 会由 GitHub Actions 自动创建。

### 1.4 目录结构说明

```
/opt/river/
├── docker-compose.prod.yml   # Docker Compose 配置 (自动部署)
├── .env                      # 环境变量文件 (自动生成)
├── nginx/
│   └── nginx.conf            # Nginx 配置 (自动部署)
├── ssl/                      # SSL 证书 (手动放置，可选)
│   ├── cert.pem
│   └── key.pem
├── admin-dist/               # Vue Admin 静态文件 (自动部署)
└── data/
    ├── mysql/                # MySQL 数据 (自动创建)
    └── redis/                # Redis 数据 (自动创建)
```

---

## 二、GitHub 配置

### 2.1 配置 Secrets

在 GitHub 仓库页面：`Settings` → `Secrets and variables` → `Actions` → `New repository secret`

添加以下 Secrets：

| Secret 名称 | 说明 | 示例 |
|-------------|------|------|
| `SERVER_HOST` | 服务器 IP 地址 | `123.45.67.89` |
| `SERVER_USER` | SSH 用户名 | `root` |
| `SERVER_SSH_KEY` | SSH 私钥（完整内容） | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `SERVER_PORT` | SSH 端口 | `22` |
| `MYSQL_PASSWORD` | 数据库密码 | `your-strong-password` |

### 2.2 生成 SSH 密钥（如需要）

```bash
# 在本地生成密钥对
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github-actions

# 将公钥添加到服务器
ssh-copy-id -i ~/.ssh/github-actions.pub root@your-server-ip

# 私钥内容添加到 GitHub Secret (SERVER_SSH_KEY)
cat ~/.ssh/github-actions
```

---

## 三、部署

### 3.1 触发部署

**方式一：推送代码到 main 分支**
```bash
git push origin main
```

**方式二：手动触发**

GitHub 仓库页面 → `Actions` → `Build and Deploy` → `Run workflow`

### 3.2 部署流程

```
1. 并行构建 3 个 Docker 镜像
   ├── river-server    (Java 后端)
   ├── river-ui-admin  (Vue 管理后台)
   └── river-ecommica  (Next.js 优惠站)

2. 推送镜像到 ghcr.io

3. SSH 到服务器执行：
   ├── 复制 docker-compose.prod.yml 和 nginx.conf
   ├── 创建 data 目录
   ├── 生成 .env 文件
   ├── 提取 admin 静态文件
   ├── 拉取最新镜像
   └── 重启所有服务
```

### 3.3 首次部署后验证

```bash
# SSH 到服务器
ssh root@your-server-ip

# 查看容器状态
cd /opt/river
docker-compose -f docker-compose.prod.yml ps

# 预期输出：5 个容器都是 Up 状态
# - river-postgres
# - river-redis
# - river-server
# - river-ecommica
# - river-nginx
```

---

## 四、运维命令

### 4.1 查看状态

```bash
cd /opt/river

# 查看所有容器状态
docker-compose -f docker-compose.prod.yml ps

# 查看容器资源使用
docker stats
```

### 4.2 查看日志

```bash
cd /opt/river

# 查看所有服务日志
docker-compose -f docker-compose.prod.yml logs

# 查看特定服务日志（实时跟踪）
docker-compose -f docker-compose.prod.yml logs -f river-server
docker-compose -f docker-compose.prod.yml logs -f river-ecommica
docker-compose -f docker-compose.prod.yml logs -f nginx
docker-compose -f docker-compose.prod.yml logs -f postgres

# 查看最近 100 行日志
docker-compose -f docker-compose.prod.yml logs --tail=100 river-server
```

### 4.3 重启服务

```bash
cd /opt/river

# 重启所有服务
docker-compose -f docker-compose.prod.yml restart

# 重启单个服务
docker-compose -f docker-compose.prod.yml restart river-server
docker-compose -f docker-compose.prod.yml restart nginx
```

### 4.4 停止/启动服务

```bash
cd /opt/river

# 停止所有服务
docker-compose -f docker-compose.prod.yml down

# 启动所有服务
docker-compose -f docker-compose.prod.yml up -d

# 停止并删除数据卷（危险！会删除数据库）
docker-compose -f docker-compose.prod.yml down -v
```

### 4.5 手动拉取最新镜像

```bash
cd /opt/river

# 登录 GitHub Container Registry
echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# 拉取最新镜像
docker-compose -f docker-compose.prod.yml pull

# 重启服务
docker-compose -f docker-compose.prod.yml up -d
```

### 4.6 清理磁盘空间

```bash
# 清理未使用的镜像
docker image prune -f

# 清理所有未使用的资源（镜像、容器、网络）
docker system prune -f

# 查看磁盘使用情况
docker system df
```

---

## 五、数据库操作

### 5.1 连接数据库

```bash
# 进入 postgres 容器
docker exec -it river-postgres psql -U postgres -d river

# 常用 SQL 命令
\dt                    # 列出所有表
\d table_name          # 查看表结构
\q                     # 退出
```

### 5.2 数据库备份

```bash
# 备份数据库
docker exec river-postgres pg_dump -U postgres river > /opt/river/backup/river_$(date +%Y%m%d_%H%M%S).sql

# 创建备份目录
mkdir -p /opt/river/backup
```

### 5.3 数据库恢复

```bash
# 恢复数据库
cat backup_file.sql | docker exec -i river-postgres psql -U postgres -d river
```

### 5.4 连接 Redis

```bash
# 进入 redis 容器
docker exec -it river-redis redis-cli

# 常用命令
keys *                 # 列出所有 key
get key_name           # 获取 key 值
flushall               # 清空所有数据（危险！）
quit                   # 退出
```

---

## 六、故障排查

### 6.1 容器无法启动

```bash
# 查看容器日志
docker-compose -f docker-compose.prod.yml logs river-server

# 查看容器详情
docker inspect river-server
```

### 6.2 端口被占用

```bash
# 查看端口占用
netstat -tlnp | grep 80
lsof -i :80

# 停止占用进程
kill -9 <PID>
```

### 6.3 磁盘空间不足

```bash
# 查看磁盘使用
df -h

# 查看 Docker 占用
docker system df

# 清理
docker system prune -a -f
```

### 6.4 数据库连接失败

```bash
# 检查 postgres 是否运行
docker-compose -f docker-compose.prod.yml ps postgres

# 检查日志
docker-compose -f docker-compose.prod.yml logs postgres

# 检查网络
docker network ls
docker network inspect river_river-network
```

### 6.5 Nginx 502 错误

```bash
# 检查后端服务是否运行
docker-compose -f docker-compose.prod.yml ps river-server
docker-compose -f docker-compose.prod.yml ps river-ecommica

# 检查 nginx 日志
docker-compose -f docker-compose.prod.yml logs nginx

# 检查后端服务日志
docker-compose -f docker-compose.prod.yml logs river-server
```

---

## 七、访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| 优惠站 | `http://{SERVER_IP}/` | Next.js 前端 |
| 管理后台 | `http://{SERVER_IP}/admin` | Vue Admin |
| 管理后台 API | `http://{SERVER_IP}/admin-api/` | Spring Boot |
| 公开 API | `http://{SERVER_IP}/app-api/` | Spring Boot |

---

## 八、安全建议

1. **修改默认端口**：SSH 使用非标准端口
2. **配置防火墙**：只开放 80、443、SSH 端口
3. **启用 HTTPS**：配置 SSL 证书
4. **定期备份**：设置数据库自动备份
5. **监控告警**：配置服务器监控

### 配置防火墙示例

```bash
# 安装 ufw
apt install ufw

# 允许 SSH（假设端口 22）
ufw allow 22/tcp

# 允许 HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# 启用防火墙
ufw enable

# 查看状态
ufw status
```
