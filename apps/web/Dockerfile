# apps/web/Dockerfile

# --- 阶段 1: 构建 ---
FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

# 1. 复制骨架
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 2. 复制子项目 package.json
COPY apps/web/package.json ./apps/web/
COPY packages/shared-types/package.json ./packages/shared-types/

# 3. 安装依赖
RUN pnpm install --frozen-lockfile

# 4. 复制源码
COPY packages/shared-types ./packages/shared-types
COPY apps/web ./apps/web

# 5. 构建依赖
RUN pnpm --filter @forum/shared-types build

# 6. 构建 Web (传递参数)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm --filter web build

# --- 阶段 2: 运行 ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

RUN npm install -g pnpm

# 1. 复制根目录依赖
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# 2. 复制子项目的 node_modules (这里包含 next 命令的软链接)
COPY --from=builder /app/apps/web/node_modules ./apps/web/node_modules

# 3. 复制 packages (因为软链接指向这里)
COPY --from=builder /app/packages ./packages

# 4. 复制构建产物
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000

# 启动
CMD ["pnpm", "--filter", "web", "start"]