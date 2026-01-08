# Dev Forum 🚀

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-red)](https://nestjs.com/)
[![Go](https://img.shields.io/badge/Go-1.23-blue)](https://go.dev/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED)](https://www.docker.com/)

[English](#english) | [中文说明](#中文说明)

---

<a name="english"></a>
## 📖 English

**Dev Forum** is a modern, high-performance full-stack forum boilerplate.

It features a unique **"Dual Engine" architecture**, allowing you to seamlessly switch the backend implementation between **Node.js (NestJS)** and **Golang (Gin)** without changing a single line of frontend code. This project serves as an excellent reference for full-stack architecture, performance benchmarking, and cross-language microservice design.

### ✨ Key Features

* **Dual Backend Support**: Switch between **NestJS** and **Go** instantly using Docker Compose Profiles.
* **Unified API Contract**: Both backends implement the exact same RESTful API standards, response structures, and error codes.
* **Modern Frontend**: Built with **Next.js 15 (App Router)**, TypeScript, and Tailwind CSS.
* **Performance First**: Implements **Redis Cache-Aside pattern** to protect the database.
* **Enterprise Grade**:
    * **JWT Authentication**: Secure stateless authentication.
    * **Structured Logging**: JSON-formatted logs ready for ELK/Loki.
    * **Dockerized**: Production-ready `docker-compose` setup with Nginx reverse proxy.

### 🛠 Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 15** | React Framework with App Router & SSR |
| **Backend A** | **NestJS** | Progressive Node.js framework + Prisma ORM |
| **Backend B** | **Golang (Gin)** | High-performance Go web framework + GORM |
| **Database** | **PostgreSQL** | Relational database |
| **Cache** | **Redis** | In-memory data store for caching |
| **Infra** | **Docker & Nginx** | Containerization and Reverse Proxy |

### 🚀 Getting Started

#### 1. Prerequisites
* Docker & Docker Compose installed.
* Node.js (for local frontend development, optional).
* Go (for local backend development, optional).

#### 2. Configuration
Create a `.env` file in the root directory (or use the system environment variables in Docker):

```ini
# Database
DB_USER=myuser
DB_PASSWORD=mypassword
JWT_SECRET=super_secret_key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:80 # Access via Nginx
```

#### 3. Run with Docker (The Magic Part)

You can choose which backend engine to start using `--profile`.

**Option A: Start with Go Engine (High Performance)**
```bash
docker-compose -f docker-compose.local-prod.yml --profile go up -d --build
```

**Option B: Start with NestJS Engine (Node.js Ecosystem)**
```bash
# Stop the Go container first to release the port
docker-compose -f docker-compose.local-prod.yml --profile go down

# Start NestJS
docker-compose -f docker-compose.local-prod.yml --profile nest up -d --build
```

Access the application at: `http://localhost`

### 📂 Project Structure

```text
.
├── apps/
│   ├── web/          # Next.js Frontend
│   ├── api/          # NestJS Backend (Node.js)
│   └── go-api/       # Gin Backend (Golang)
├── docker-compose.local-prod.yml  # Main entry for dual-engine setup
├── nginx.local.conf  # Nginx configuration
└── deploy.sh         # CI/CD Deployment script
```

---

<a name="中文说明"></a>
## 📖 中文说明

**Dev Forum** 是一个现代化的、高性能全栈论坛脚手架项目。

该项目最大的亮点在于其 **“双引擎”架构**，允许你通过 Docker 配置无缝切换后端实现（**Node.js/NestJS** 或 **Golang/Gin**），而无需修改任何前端代码。这不仅是一个功能完备的论坛系统，更是学习全栈架构、性能对比以及跨语言微服务设计的绝佳范例。

### ✨ 核心特性

* **双后端支持**：利用 Docker Compose Profiles，一键在 **NestJS** 和 **Go** 之间切换后端服务。
* **统一接口契约**：两个后端实现了完全一致的 RESTful API、响应结构 `{ code, message, data }` 和错误码体系。
* **现代化前端**：基于 **Next.js 15 (App Router)**、TypeScript 和 Tailwind CSS 构建。
* **性能优先**：实现了 **Redis 旁路缓存 (Cache-Aside)** 策略，有效降低数据库压力。
* **企业级规范**：
    * **JWT 鉴权**：安全的无状态身份验证。
    * **结构化日志**：统一输出 JSON 格式日志，便于接入 ELK 或 Loki。
    * **容器化部署**：包含生产级 Docker 配置及 Nginx 反向代理。

### 🛠 技术栈

| 组件 | 技术 | 说明 |
| :--- | :--- | :--- |
| **前端** | **Next.js 15** | React 框架 (App Router & SSR) |
| **后端 A** | **NestJS** | 渐进式 Node.js 框架 + Prisma ORM |
| **后端 B** | **Golang (Gin)** | 高性能 Go Web 框架 + GORM |
| **数据库** | **PostgreSQL** | 关系型数据库 |
| **缓存** | **Redis** | 内存数据库，用于加速查询 |
| **基础设施** | **Docker & Nginx** | 容器编排与反向代理 |

### 🚀 快速开始

#### 1. 前置要求
* 已安装 Docker 和 Docker Compose。
* (可选) 本地开发需安装 Node.js 和 Go 环境。

#### 2. 环境变量配置
在项目根目录创建 `.env` 文件：

```ini
# 数据库配置
DB_USER=myuser
DB_PASSWORD=mypassword
JWT_SECRET=super_secret_key

# 前端配置 (通过 Nginx 访问)
NEXT_PUBLIC_API_URL=http://localhost:80
```

#### 3. 启动项目 (见证奇迹的时刻)

你可以通过 `--profile` 参数选择启动哪个后端引擎。

**方案 A：启动 Go 引擎 (高性能模式)**
```bash
docker-compose -f docker-compose.local-prod.yml --profile go up -d --build
```

**方案 B：启动 NestJS 引擎 (Node 生态模式)**
```bash
# 先停止 Go 容器以释放端口
docker-compose -f docker-compose.local-prod.yml --profile go down

# 启动 NestJS
docker-compose -f docker-compose.local-prod.yml --profile nest up -d --build
```

启动后，访问浏览器：`http://localhost`

### 📂 项目目录结构

```text
.
├── apps/
│   ├── web/          # Next.js 前端应用
│   ├── api/          # NestJS 后端应用 (Node.js)
│   └── go-api/       # Gin 后端应用 (Golang)
├── docker-compose.local-prod.yml  # 双引擎启动核心配置
├── nginx.local.conf  # Nginx 反向代理配置
└── deploy.sh         # 自动化部署脚本
```

### 📝 许可证 / License

MIT License