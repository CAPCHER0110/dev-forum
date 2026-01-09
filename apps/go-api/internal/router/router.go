package router

import (
	"go-api/internal/handlers"
	"go-api/internal/pkg/apperr"
	"go-api/internal/pkg/response"
	"go-api/internal/svc"
	"log/slog"
	"net/http"

	"go-api/internal/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func SetupRouter(ctx *svc.ServiceContext) *gin.Engine {
	// r := gin.Default()
	r := gin.New() // 改用 gin.New()，手动挂载中间件，不使用默认的
	r.Use(middleware.TraceMiddleware())
	r.Use(middleware.StructuredLogger())
	r.Use(gin.Recovery()) // 崩溃恢复
	r.Use(gin.CustomRecovery(func(c *gin.Context, recovered interface{}) {
		slog.Error("panic_recovered", "err", recovered)
		response.Fail(c, http.StatusInternalServerError, apperr.CodeInternalError, "系统开小差了，请稍后再试")
	}))

	// 1. CORS 配置 (对齐 NestJS 的允许范围)
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	r.Use(cors.New(config))

	// 暴露 Prometheus 监控指标接口
	// Prometheus 会定时来这里“扒”数据
	r.GET("/metrics", gin.WrapH(promhttp.Handler()))

	// 2. 初始化处理器
	postHandler := handlers.NewPostHandler(ctx)
	authHandler := handlers.NewAuthHandler(ctx)
	paymentHandler := handlers.NewPaymentHandler(ctx)

	// 认证路由
	auth := r.Group("/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
	}

	// 3. 路由定义：保持与 NestJS 路径 100% 一致
	// NestJS 里是 @Controller('posts')，对应路径就是 /posts
	r.GET("/posts", postHandler.GetPosts)
	r.GET("/posts/:id", postHandler.GetPostDetail)
	// r.POST("/posts", postHandler.CreatePost)
	r.POST("/posts", middleware.JWTAuth(ctx.Config.JWTSecret), postHandler.CreatePost)

	r.POST("/upload", middleware.JWTAuth(ctx.Config.JWTSecret), handlers.Upload)

	// 支付模块
	payment := r.Group("/payment")
	{
		// Webhook 必须是公开的 (不需要 Auth Middleware)
		// Stripe 服务器会直接访问这个接口
		payment.POST("/webhook", paymentHandler.HandleWebhook)

		// 创建支付链接需要登录
		payment.POST("/checkout", middleware.JWTAuth(ctx.Config.JWTSecret), paymentHandler.CreateCheckoutSession)
	}

	return r
}
