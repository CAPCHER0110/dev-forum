# apps/api/Dockerfile

# --- 阶段 1: 构建 ---
FROM node:20-slim AS builder

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

# 安装 pnpm
RUN npm install -g pnpm

# 1. 复制 Monorepo 骨架
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 2. 复制相关 package.json
COPY apps/api/package.json ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/

# 3. 安装依赖
RUN pnpm install --frozen-lockfile

# 4. 复制源码
COPY packages/shared-types ./packages/shared-types
COPY apps/api ./apps/api

# 5. 生成 Prisma Client
RUN pnpm --filter ./apps/api exec prisma generate --schema=./prisma/schema.prisma

# 6. 先构建 shared-types
RUN pnpm --filter @forum/shared-types build

# 7. 构建 NestJS 应用
RUN pnpm --filter api build

# --- 阶段 2: 运行 ---
FROM node:20-slim AS runner

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl ca-certificates

RUN npm install -g pnpm

# 1. 复制根目录依赖 (Store & Hoisted)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# 2. 复制子项目的 node_modules (包含 Symlinks)
# 没有这一行，Node 找不到 @nestjs/core 等依赖
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

# 3. 关键修正：复制 packages 目录
# 因为 shared-types 是通过软链引用的，必须保证物理文件存在
COPY --from=builder /app/packages ./packages

# 4. 复制构建产物
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

EXPOSE 4000

# 启动
CMD ["pnpm", "--filter", "api", "run", "start:prod"]