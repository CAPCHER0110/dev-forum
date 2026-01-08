package database

import (
	"log"
	"time"

	"go-api/internal/models" // 引入 models

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Connect(dsn string) *gorm.DB {
	var db *gorm.DB
	var err error

	// 简单的指数退避重试，适合 Docker 启动场景
	for i := 1; i <= 5; i++ {
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err == nil {
			log.Println("✅ Database connected successfully!")
			break
		}
		log.Printf("⚠️ Failed to connect to DB (attempt %d/5): %v. Retrying in 2s...", i, err)
		time.Sleep(2 * time.Second)
	}

	if err != nil {
		log.Fatal("❌ Could not connect to database after retries")
	}

	// 自动迁移模式
	log.Println("Running AutoMigrate...")
	err = db.AutoMigrate(&models.Post{}, &models.User{})

	if err != nil {
		log.Fatal("❌ AutoMigrate failed:", err)
	}

	return db
}
