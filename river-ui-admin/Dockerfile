# 构建阶段
FROM node:22-alpine AS builder
WORKDIR /app

# 启用 corepack 并安装 pnpm
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install

# 复制源代码
COPY . .

# 构建生产版本
RUN pnpm build:prod

# 运行阶段 - 使用 nginx 托管静态文件
FROM nginx:alpine
COPY --from=builder /app/dist-prod /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
