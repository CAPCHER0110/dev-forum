package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"go-api/internal/config"
	"go-api/internal/consts"
	"go-api/internal/logger"
	"go-api/internal/models"
	"go-api/internal/pkg/apperr"
	"go-api/internal/pkg/mq"
	"go-api/internal/pkg/response"
	"go-api/internal/svc"

	"github.com/gin-gonic/gin"
)

type PostHandler struct {
	svc *svc.ServiceContext
}

func NewPostHandler(ctx *svc.ServiceContext) *PostHandler {
	return &PostHandler{
		svc: ctx,
	}
}

// GET /posts
func (h *PostHandler) GetPosts(c *gin.Context) {
	ctx := c.Request.Context()
	cacheKey := consts.CacheKeyPostList
	logger.Info(c, "开始查询帖子列表", "cache_key", cacheKey)

	// 尝试从 Redis 拿数据
	cachedData, err := h.svc.Redis.Get(ctx, cacheKey).Result()
	if err == nil {
		var posts []models.Post
		json.Unmarshal([]byte(cachedData), &posts)
		logger.Info(c, "cache_hit", "key", cacheKey)
		response.Success(c, posts)
		return
	}

	// 缓存没命中，查数据库
	var posts []models.Post
	// 1. 把 created_at 改成 createdAt (Prisma 的列名)
	// 2. 必须加上转义的双引号 \"...\"，否则 Postgres 会把它转成小写！
	if err := h.svc.DB.Order("\"createdAt\" desc").Find(&posts).Error; err != nil {
		logger.Error(c, "数据库查询失败", "error", err.Error())
		// c.JSON(http.StatusInternalServerError, gin.H{"error": "获取列表失败"})
		response.Fail(c, http.StatusInternalServerError, apperr.CodeInternalError, apperr.GetMsg(apperr.CodeInternalError))
		return
	}

	logger.Info(c, "cache_miss_db_query", "key", cacheKey)

	// 回写 Redis，设置过期时间 (比如 5 分钟)
	jsonData, _ := json.Marshal(posts)
	h.svc.Redis.Set(ctx, cacheKey, jsonData, 5*time.Minute)

	response.Success(c, posts)
	// c.JSON(http.StatusOK, posts)
}

// GET /posts/:id
func (h *PostHandler) GetPostDetail(c *gin.Context) {
	id := c.Param("id")
	var post models.Post
	if err := h.svc.DB.First(&post, id).Error; err != nil {
		// c.JSON(http.StatusNotFound, gin.H{"error": "文章不存在"})
		response.Fail(c, http.StatusNotFound, apperr.CodeArticleNotExist, apperr.GetMsg(apperr.CodeArticleNotExist))
		return
	}
	// c.JSON(http.StatusOK, post)
	response.Success(c, post)
}

// POST /posts (补全功能)
func (h *PostHandler) CreatePost(c *gin.Context) {
	// 从 Context 中提取中间件注入的 userID
	userID, exists := c.Get("userID")
	if !exists {
		// c.JSON(http.StatusInternalServerError, gin.H{"error": "无法获取用户信息"})
		response.Fail(c, http.StatusInternalServerError, apperr.CodeUnauthorized, apperr.GetMsg(apperr.CodeUnauthorized))
		return
	}

	// 1. 定义接收结构：同时支持 json 和 form 标签
	var input struct {
		// form:"title"
		Title string `json:"title" form:"title" binding:"required"`
		// form:"content"
		Content string `json:"content" form:"content"`
	}

	// 2. 修改这里：从 ShouldBindJSON 改为 ShouldBind
	// 它会自动根据 Content-Type 决定怎么解析
	if err := c.ShouldBind(&input); err != nil {
		// c.JSON(http.StatusBadRequest, gin.H{"error": "标题是必填项"})
		response.Fail(c, http.StatusBadRequest, apperr.CodeTitleNotExist, apperr.GetMsg(apperr.CodeTitleNotExist))
		return
	}

	// 2. 转换成数据库模型
	newPost := models.Post{
		Title:     input.Title,
		Content:   input.Content,
		Published: true, // 默认发布
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		AuthorID:  convertToUint(userID),
	}

	// 3. 写入数据库
	if err := h.svc.DB.Create(&newPost).Error; err != nil {
		// c.JSON(http.StatusInternalServerError, gin.H{"error": "创建失败"})
		response.Fail(c, http.StatusInternalServerError, apperr.CodeInternalError, apperr.GetMsg(apperr.CodeInternalError))
		return
	}

	cacheKey := consts.CacheKeyPostList
	h.svc.Redis.Del(c.Request.Context(), cacheKey)
	logger.Info(c, "cache_evicted", "key", cacheKey)

	cfg := config.Load() // 或者从 svc 中获取，如果在 svc 中存了的话
	logger.Info(c, "config", "cfg.RabbitMQ.URL", cfg.RabbitMQ.URL, "cfg.RabbitMQ.QueueName", cfg.RabbitMQ.QueueName)

	// 异步发送消息
	// 注意：实际生产中建议单例注入 mq 实例，不要每次 New
	go func() {
		mqClient, err := mq.NewRabbitMQ(cfg.RabbitMQ.URL, cfg.RabbitMQ.QueueName)
		if err == nil {
			defer mqClient.Close()
			mqClient.PublishNewPost(newPost.ID, newPost.Title)
		}
	}()

	// 4. 返回成功，结果与 NestJS 保持一致
	// c.JSON(http.StatusCreated, newPost)
	response.Success(c, newPost)
}

// 辅助函数：处理 JWT 解析后恼人的数字类型问题
func convertToUint(val interface{}) uint {
	switch v := val.(type) {
	case float64:
		return uint(v)
	case int:
		return uint(v)
	case uint:
		return v
	default:
		return 0
	}
}
