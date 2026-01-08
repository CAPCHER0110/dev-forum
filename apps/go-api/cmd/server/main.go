package main

import (
	"log/slog"

	"go-api/internal/config" // 引入配置包
	"go-api/internal/database"
	"go-api/internal/logger"
	"go-api/internal/router"
	"go-api/internal/svc"
)

func main() {
	logger.Init()
	slog.Info("Server is starting...", "port", 4000) // 结构化写法：消息 + 键值对

	// 1. 加载配置 (所有“脏活”都在这里面处理了)
	cfg := config.Load()

	// 2. 初始化资源 (传入具体的配置项)
	// 如果你的 Connect 仅仅需要字符串，直接传 cfg.DatabaseDSN
	// 如果后续 Connect 需要更多参数，可以考虑把整个 cfg 传进去
	db := database.Connect(cfg.DatabaseDSN)

	// 如果你实现了 Redis，也可以在这里初始化
	rdb := database.ConnectRedis(cfg.RedisAddr)
	defer rdb.Close()

	// 组装 ServiceContext (装箱)
	serviceCtx := svc.NewServiceContext(cfg, db, rdb)

	// 3. 设置并启动路由
	r := router.SetupRouter(serviceCtx)

	slog.Info("🚀 Server is running on", "port", cfg.ServerPort)
	r.Run(":" + cfg.ServerPort)
}
