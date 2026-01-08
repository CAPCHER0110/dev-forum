FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm

COPY package.json ./
RUN pnpm install

COPY . .

# 声明构建参数 (ARG)
ARG NEXT_PUBLIC_API_URL

# 将参数固化为环境变量 (ENV)，这样 npm run build 才能读到
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# 🔥 关键：Next.js 构建需要知道后端地址吗？
# 如果是 Server Component 请求，它走 Docker 内部网络
# 如果是 Client Component 请求，它走浏览器外部网络
# 这里先暂时留空，依靠运行时环境变量
RUN pnpm run build

FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "run", "start"]