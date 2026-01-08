package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Config 聚合所有配置项
type Config struct {
	DatabaseDSN string
	RedisAddr   string
	ServerPort  string
	JWTSecret   string
}

// Load 加载配置 (优先级：环境变量 > 默认值)
func Load() *Config {
	// 🔥 尝试加载 .env 文件
	// 这样你在本地开发时，只需要建一个 .env 文件覆盖变量即可
	// 在 Docker 生产环境中，没有 .env 文件也不会报错，直接读系统环境变量
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️ No .env file found, using system environment variables")
	}

	return &Config{
		DatabaseDSN: getEnv("DATABASE_DSN", "host=host.docker.internal user=myuser password=mypassword dbname=dev_forum port=5432 sslmode=disable TimeZone=Asia/Shanghai"),
		RedisAddr:   getEnv("REDIS_ADDR", "host.docker.internal:6379"),
		ServerPort:  getEnv("PORT", "4000"),
		JWTSecret:   getEnv("JWT_SECRET", "dev_test_key"),
	}
}

// 辅助函数：获取环境变量，如果没有则返回 fallback 默认值
func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
