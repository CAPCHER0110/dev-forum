package svc

import (
	"go-api/internal/config"

	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

// ServiceContext 是一个容器，持有所有全局依赖
type ServiceContext struct {
	Config *config.Config
	DB     *gorm.DB
	Redis  *redis.Client
}

// NewServiceContext 工厂函数
func NewServiceContext(c *config.Config, db *gorm.DB, rdb *redis.Client) *ServiceContext {
	return &ServiceContext{
		Config: c,
		DB:     db,
		Redis:  rdb,
	}
}
