package main

import (
	"log/slog"

	"go-api/internal/config" // 引入配置包
	"go-api/internal/database"
	"go-api/internal/logger"
	"go-api/internal/pkg/mq"
	"go-api/internal/router"
	"go-api/internal/svc"
	"go-api/internal/worker"
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

	// 1. 初始化 RabbitMQ 连接
	// 注意：生产环境建议把连接配置放在 global 或者 wire 注入中，这里为了演示简单写
	// rabbitUrl := fmt.Sprintf("amqp://%s:%s@rabbitmq:5672/", "user", "password")
	slog.Info("main:config", "cfg.RabbitMQ.URL", cfg.RabbitMQ.URL, "cfg.RabbitMQ.QueueName", cfg.RabbitMQ.QueueName)
	mqClient, err := mq.NewRabbitMQ(cfg.RabbitMQ.URL, cfg.RabbitMQ.QueueName)
	if err != nil {
		// 如果连不上 MQ，可以选择 panic，或者降级运行
		slog.Info("⚠️ Warning: RabbitMQ connect failed", "err", err)
	} else {
		defer mqClient.Close()

		// 启动消费者 (它会在后台默默工作)
		// 把 worker.HandleNewPost 函数传进去
		mqClient.StartConsumer(worker.HandleNewPost)
	}

	// 3. 设置并启动路由
	r := router.SetupRouter(serviceCtx)

	slog.Info("🚀 Server is running on", "port", cfg.ServerPort)
	r.Run(":" + cfg.ServerPort)
}
