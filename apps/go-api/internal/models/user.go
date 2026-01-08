package models

import "time"

// User 对应 Prisma 生成的 "User" 表
type User struct {
	ID       uint   `gorm:"primaryKey;column:id" json:"id"`
	Email    string `gorm:"column:email;unique;not null" json:"email"`
	Name     string `gorm:"column:name" json:"name"`
	Password string `gorm:"column:password" json:"-"` // json:"-" 表示返回前端时不带密码

	// Prisma 是驼峰 createdAt，必须映射
	CreatedAt time.Time `gorm:"column:createdAt" json:"createdAt"`
	UpdatedAt time.Time `gorm:"column:updatedAt" json:"updatedAt"`
}

// 强制指定表名为 "User" (区分大小写)
func (User) TableName() string {
	return "User"
}
