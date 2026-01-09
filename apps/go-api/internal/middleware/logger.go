package middleware

import (
	"go-api/internal/logger"
	"log/slog"
	"time"

	"github.com/gin-gonic/gin"
)

func StructuredLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 如果是监控请求，直接跳过日志记录
		if c.Request.URL.Path == "/metrics" {
			c.Next()
			return
		}

		start := time.Now()
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery

		// 处理请求
		c.Next()

		// 记录结束时的各种参数
		end := time.Now()
		latency := end.Sub(start)

		logger.Info(c, "incoming_request",
			slog.Int("status", c.Writer.Status()),
			slog.String("method", c.Request.Method),
			slog.String("path", path),
			slog.String("query", query),
			slog.String("ip", c.ClientIP()),
			slog.Duration("latency", latency),
			slog.String("user_agent", c.Request.UserAgent()),
		)
	}
}
