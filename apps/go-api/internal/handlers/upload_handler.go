package handlers

import (
	"fmt"
	"go-api/internal/config"
	"go-api/internal/pkg/response"
	"go-api/internal/pkg/storage"
	"net/http"

	"github.com/gin-gonic/gin"
)

func Upload(c *gin.Context) {
	// 1. 获取文件
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		response.Fail(c, http.StatusBadRequest, 40001, "No file uploaded")
		return
	}
	defer file.Close()

	// 2. 初始化 S3 服务 (实际项目中应该在 main.go 初始化并注入，这里为了简单直接创建)
	cfg := config.Load()
	s3Service, err := storage.NewS3Service(cfg.AWSHeader)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, 50001, "Storage init failed")
		return
	}

	// 3. 上传
	url, err := s3Service.UploadFile(file, header)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, 50002, "Upload failed")
		return
	}

	// 4. 返回 URL
	// 假设我们通过 Nginx 代理了 MinIO，或者直接用 localhost:9000
	// 生产环境中，这个 baseUrl 应该配置在 env 里
	finalUrl := fmt.Sprintf("/uploads/%s", url)
	response.Success(c, gin.H{"url": finalUrl})
}
