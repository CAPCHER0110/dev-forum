// apps/go-api/internal/logger/logger.go
package logger

import (
	"context"
	"io"
	"log/slog"
	"os"

	"github.com/gin-gonic/gin"
	"gopkg.in/natefinch/lumberjack.v2"
)

var Log *slog.Logger

// Init 初始化全局 Logger (JSON 格式，方便 Kibana 解析)
func Init() {
	// handler := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
	// 	Level: slog.LevelDebug,
	// 	// 可以自定义时间格式等
	// })
	// Log = slog.New(handler)

	// 1. 配置日志文件切割规则
	fileWriter := &lumberjack.Logger{
		Filename:   "logs/app.log", // 日志文件路径
		MaxSize:    10,             // 每个日志文件最大 10MB
		MaxBackups: 5,              // 最多保留 5 个旧文件
		MaxAge:     30,             // 最多保留 30 天
		Compress:   true,           // 是否压缩旧日志 (打成 .gz)
	}

	// 2. 🔥 核心技巧：MultiWriter
	// 既写文件，又写控制台 (Stdout)
	// 这样你在 Docker logs 里能看到，去服务器 logs/ 目录下也能看到文件
	multiWriter := io.MultiWriter(os.Stdout, fileWriter)

	// 3. 创建 Handler
	handler := slog.NewJSONHandler(multiWriter, &slog.HandlerOptions{
		Level: slog.LevelDebug,
		// 可选：把 Source 加上，显示是哪行代码打的日志（生产环境建议关掉，有性能损耗）
		AddSource: true,
	})

	Log = slog.New(handler)
}

// 辅助函数：尝试从 Context 中提取 TraceID
func getTraceID(ctx context.Context) string {
	// 如果是 Gin 的 Context
	if c, ok := ctx.(*gin.Context); ok {
		return c.GetString("trace_id")
	}
	// 如果是标准 Context (将来扩展用)
	if id, ok := ctx.Value("trace_id").(string); ok {
		return id
	}
	return ""
}

// 🔥 封装带 Context 的日志方法

func Info(ctx context.Context, msg string, args ...any) {
	id := getTraceID(ctx)
	// 将 trace_id 作为一个固定字段追加到 args 里
	args = append(args, "trace_id", id)
	Log.Info(msg, args...)
}

func Error(ctx context.Context, msg string, args ...any) {
	id := getTraceID(ctx)
	args = append(args, "trace_id", id)
	Log.Error(msg, args...)
}

// 你可以继续封装 Warn, Debug...
