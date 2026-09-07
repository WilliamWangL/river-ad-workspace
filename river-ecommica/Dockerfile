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
RUN pnpm build

# 运行阶段
FROM node:22-alpine
WORKDIR /app

# 从构建阶段复制 standalone 输出
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server.js"]
