package models

import (
	"time"
)

// Post 对应数据库中的 Post 表 (Prisma 创建的)
type Post struct {
	ID uint `gorm:"primaryKey;column:id" json:"id"`
	// 指定 column:title 虽非必须(如果也是小写)，但为了保险加上
	Title     string `gorm:"column:title;type:varchar(255);not null" json:"title" binding:"required"`
	Content   string `gorm:"column:content;type:text" json:"content"`
	Published bool   `gorm:"column:published;default:false" json:"published"`

	// 🔥 关键点：Prisma 字段是驼峰 createdAt，GORM 默认找 created_at，必须手动指定
	CreatedAt time.Time `gorm:"column:createdAt" json:"createdAt"`
	UpdatedAt time.Time `gorm:"column:updatedAt" json:"updatedAt"`

	// 如果有关联用户，Prisma 通常是 authorId
	AuthorID uint `gorm:"column:authorId" json:"authorId"`
}

// 🔥 核心修改：重写 TableName 方法
// 告诉 GORM：这张表的名字叫 "Post"，不是 "posts"
func (Post) TableName() string {
	return "Post"
}
