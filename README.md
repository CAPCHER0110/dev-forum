# Dev Forum 🚀

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-red)](https://nestjs.com/)
[![Go](https://img.shields.io/badge/Go-1.23-blue)](https://go.dev/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED)](https://www.docker.com/)
[![pnpm](https://img.shields.io/badge/pnpm-Workspace-orange)](https://pnpm.io/)

[English](#english) | [中文说明](#中文说明)

---

<a name="english"></a>
## 📖 English

**Dev Forum** is a modern, high-performance full-stack forum boilerplate featuring a **"Dual Engine" Architecture** and a **Monorepo** structure.

It allows you to seamlessly switch the backend implementation between **Node.js (NestJS)** and **Golang (Gin)** without changing a single line of frontend code. The project is engineered for resilience, type safety, and production readiness.

### ✨ Key Features

* **🏗 Monorepo Architecture**: Managed by **pnpm workspaces**, enabling code sharing (DTOs, Types) between Frontend and Backend.
* **⚔️ Dual Backend Support**: Switch between **NestJS** and **Go** instantly using Docker Compose Profiles.
* **🛡 Full-Stack Type Safety**: A shared package (`@forum/shared-types`) ensures that API changes instantly trigger compile-time checks in the Frontend.
* **🚀 Production Ready Startup**:
    * **Healthchecks**: Services wait for Database & Redis to be fully healthy before starting.
    * **Auto Migrations**: Database schemas are automatically applied on container startup.
    * **Resilient Nginx**: Dynamic DNS resolution prevents Nginx from crashing if upstreams are slow to start.
* **⚡ Performance First**: Implements **Redis Cache-Aside pattern** and optimized Docker builds (Multi-stage + Slim images).

### 🛠 Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 15** | React Framework with App Router & SSR |
| **Backend A** | **NestJS** | Progressive Node.js framework + Prisma ORM |
| **Backend B** | **Golang (Gin)** | High-performance Go web framework + GORM |
| **Shared** | **TypeScript** | Shared DTOs/Interfaces via pnpm workspace |
| **Database** | **PostgreSQL** | Relational database |
| **Cache** | **Redis** | In-memory data store for caching |
| **Infra** | **Docker** | Compose V2 with Healthchecks & Profiles |

### 📂 Project Structure

```text
.
├── apps/
│   ├── web/          # Next.js Frontend (consumes shared-types)
│   ├── api/          # NestJS Backend (consumes shared-types)
│   └── go-api/       # Gin Backend (Independent)
├── packages/
│   └── shared-types/ # Shared TypeScript Definitions (DTOs, Interfaces)
├── docker-compose.local-prod.yml  # Main entry for dual-engine setup
├── nginx.local.conf  # Resilient Nginx configuration
└── pnpm-workspace.yaml # Monorepo configuration
```

### 🚀 Getting Started

#### 1. Prerequisites
* Docker & Docker Compose installed.
* Node.js 20+ & pnpm (for local development).

#### 2. Configuration
Create a `.env` file in the root directory:

```ini
# Database
DB_USER=myuser
DB_PASSWORD=mypassword
JWT_SECRET=super_secret_key

# Frontend (Access via Nginx)
NEXT_PUBLIC_API_URL=http://localhost:80
```

#### 3. Run with Docker (The Magic Part)

You can choose which backend engine to start using `--profile`.

**Option A: Start with Go Engine (High Performance)**
```bash
docker-compose -f docker-compose.local-prod.yml --profile go up -d --build
```

**Option B: Start with NestJS Engine (Node.js Ecosystem)**
```bash
# 1. Stop the Go container (to release port 4000)
docker-compose -f docker-compose.local-prod.yml --profile go down

# 2. Start NestJS (Auto-migration & Healthchecks included)
docker-compose -f docker-compose.local-prod.yml --profile nest up -d --build
```

*Note: The first startup might take ~30s as it waits for Postgres initialization and executes migrations.*

Access the application at: `http://localhost`

---

<a name="中文说明"></a>
## 📖 中文说明

**Dev Forum** 是一个现代化的、高性能全栈论坛脚手架，采用 **“双引擎”架构** 和 **Monorepo** 组织方式。

该项目最大的亮点在于其允许你通过 Docker 配置无缝切换后端实现（**Node.js/NestJS** 或 **Golang/Gin**），而无需修改任何前端代码。项目已针对生产环境进行了深度优化，具备高可用性和全栈类型安全。

### ✨ 核心特性

* **🏗 Monorepo 架构**：基于 **pnpm workspaces** 管理，实现前后端逻辑复用（共享 DTO 和类型定义）。
* **⚔️ 双后端支持**：利用 Docker Compose Profiles，一键在 **NestJS** 和 **Go** 之间切换后端服务。
* **🛡 全栈类型安全**：通过共享包 (`@forum/shared-types`)，后端的 API 变更会立即触发前端的编译检查，杜绝运行时错误。
* **🚀 生产级启动流程**：
    * **健康检查 (Healthchecks)**：API 服务会自动等待数据库和 Redis 彻底就绪（Healthy）后才启动。
    * **自动迁移**：容器启动时自动执行 `prisma migrate deploy`，无需手动管理数据库结构。
    * **弹性 Nginx**：配置了动态 DNS 解析，防止因后端启动慢导致 Nginx 崩溃。
* **⚡ 性能优先**：实现了 **Redis 旁路缓存 (Cache-Aside)** 策略，并优化了 Docker 镜像体积（多阶段构建）。

### 🛠 技术栈

| 组件 | 技术 | 说明 |
| :--- | :--- | :--- |
| **前端** | **Next.js 15** | React 框架 (App Router & SSR) |
| **后端 A** | **NestJS** | 渐进式 Node.js 框架 + Prisma ORM |
| **后端 B** | **Golang (Gin)** | 高性能 Go Web 框架 + GORM |
| **共享层** | **TypeScript** | 基于 pnpm workspace 的共享类型库 |
| **数据库** | **PostgreSQL** | 关系型数据库 |
| **缓存** | **Redis** | 内存数据库 |
| **基础设施** | **Docker** | Compose V2, Healthchecks, Profiles |

### 📂 项目目录结构

```text
.
├── apps/
│   ├── web/          # Next.js 前端 (依赖 shared-types)
│   ├── api/          # NestJS 后端 (依赖 shared-types)
│   └── go-api/       # Gin 后端 (独立运行)
├── packages/
│   └── shared-types/ # 共享 TypeScript 定义 (DTOs, 接口)
├── docker-compose.local-prod.yml  # 双引擎启动核心配置
├── nginx.local.conf  # 高可用 Nginx 配置
└── pnpm-workspace.yaml # Monorepo 工作区配置
```

### 🚀 快速开始

#### 1. 前置要求
* 已安装 Docker 和 Docker Compose。
* (本地开发推荐) Node.js 20+ 和 pnpm。

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
# 1. 先停止 Go 容器以释放 4000 端口
docker-compose -f docker-compose.local-prod.yml --profile go down

# 2. 启动 NestJS (包含自动迁移和健康检查)
docker-compose -f docker-compose.local-prod.yml --profile nest up -d --build
```

*注意：首次启动可能需要等待约 30 秒，因为 Docker 会等待 PostgreSQL 初始化完成并自动执行数据库迁移。*

启动后，访问浏览器：`http://localhost`

### 📝 许可证 / License

MIT License