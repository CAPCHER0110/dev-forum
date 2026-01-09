package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config 聚合所有配置项
type Config struct {
	DatabaseDSN string
	RedisAddr   string
	ServerPort  string
	JWTSecret   string
	App         AppConfig
	RabbitMQ    RabbitMQConfig
	AWSHeader   AWSConfig
	Stripe      StripeConfig
	Mail        MailConfig
}

type AppConfig struct {
	FrontendURL string // 帖子地址的域名
}

type RabbitMQConfig struct {
	URL       string
	QueueName string
}

type AWSConfig struct {
	Region          string
	AccessKeyID     string
	SecretAccessKey string
	Endpoint        string
	Bucket          string
}

type StripeConfig struct {
	SecretKey     string
	WebhookSecret string
	PriceIDPro    string
	FrontendURL   string
}

type MailConfig struct {
	Host string
	Port int
	User string
	Pass string
	From string
}

// Load 加载配置 (优先级：环境变量 > 默认值)
func Load() *Config {
	// 尝试加载 .env 文件
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
		App: AppConfig{
			FrontendURL: getEnv("FRONTEND_URL", "http://localhost:3000"),
		},
		RabbitMQ: RabbitMQConfig{
			URL:       getEnv("RABBITMQ_URI", "amqp://user:password@rabbitmq:5672/"),
			QueueName: getEnv("RABBITMQ_QUEUE", "new_post_queue"), // 从配置读取队列名
		},
		AWSHeader: AWSConfig{
			Region:          getEnv("AWS_REGION", "us-east-1"),
			AccessKeyID:     getEnv("AWS_ACCESS_KEY_ID", "admin"),
			SecretAccessKey: getEnv("AWS_SECRET_ACCESS_KEY", "password123"),
			Endpoint:        getEnv("AWS_ENDPOINT", "http://localhost:9000"), // Docker内通常用 http://minio:9000
			Bucket:          getEnv("S3_BUCKET", "forum-uploads"),
		},
		Stripe: StripeConfig{
			SecretKey:     getEnv("STRIPE_SECRET_KEY", ""),
			WebhookSecret: getEnv("STRIPE_WEBHOOK_SECRET", ""),
			PriceIDPro:    getEnv("STRIPE_PRICE_ID_PRO", ""),
			FrontendURL:   getEnv("FRONTEND_URL", "http://localhost:3000"),
		},
		Mail: MailConfig{
			Host: getEnv("MAIL_HOST", "localhost"),
			Port: getEnvInt("MAIL_PORT", 1025),
			User: getEnv("MAIL_USER", "test"),
			Pass: getEnv("MAIL_PASS", "test"),
			From: getEnv("MAIL_FROM", "no-reply@forum.local"),
		},
	}
}

// 辅助函数：获取环境变量，如果没有则返回 fallback 默认值
func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

func getEnvInt(key string, defaultValue int) int {
	value, exists := os.LookupEnv(key)
	if !exists {
		return defaultValue
	}
	i, err := strconv.Atoi(value)
	if err != nil {
		return defaultValue
	}
	return i
}
