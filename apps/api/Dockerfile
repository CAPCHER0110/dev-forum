# apps/api/Dockerfile

# 1. 构建阶段
FROM node:20-slim AS builder

WORKDIR /app

# 安装 pnpm 和 openssl (Debian 环境)
RUN apt-get update -y && apt-get install -y openssl

# 安装 pnpm
RUN npm install -g pnpm

# 复制依赖
COPY package.json ./
RUN pnpm install

# 复制源码
COPY . .

# 生成 Prisma Client
RUN npx prisma generate

# 编译
RUN pnpm run build

# 2. 运行阶段
FROM node:20-slim

WORKDIR /app

# 🔥 核心优势：Debian Slim 只需要装一个标准的 openssl 即可，绝无版本冲突
RUN apt-get update -y && apt-get install -y openssl ca-certificates

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000

CMD ["npm", "run", "start:prod"]