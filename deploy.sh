#!/bin/bash

# 1. 拉取最新代码
git pull origin main

# 2. 注入环境变量 (建议在服务器创建 .env 文件)
export $(cat .env | xargs)

# 3. 停掉旧容器，构建新镜像并启动
docker-compose -f docker-compose.prod.yml up -d --build

# 4. 清理无用的旧镜像 (百度运维准则：保持磁盘整洁)
docker image prune -f

echo "🚀 Deployment Successful!"