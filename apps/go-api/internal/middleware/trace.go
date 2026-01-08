// apps/go-api/internal/middleware/trace.go
package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const TraceIDKey = "trace_id"

func TraceMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. 尝试从请求头获取 (用于微服务透传)
		traceID := c.GetHeader("X-Trace-ID")

		// 2. 如果没有，生成一个新的 UUID
		if traceID == "" {
			traceID = uuid.New().String()
		}

		// 3. 🔥 核心：注入到 Gin 的上下文
		c.Set(TraceIDKey, traceID)

		// 4. 🔥 技巧：同时也写回响应头
		// 这样前端报错时，可以把这个 ID 截图给你，你就能直接去日志里搜
		c.Writer.Header().Set("X-Trace-ID", traceID)

		c.Next()
	}
}
