package consts

import "fmt"

const (
	// 静态 Key：帖子列表
	CacheKeyPostList = "forum:posts:list"

	// 静态 Key：系统公告
	CacheKeyAnnouncement = "forum:system:announcement"
)

// 动态 Key：帖子详情 (使用函数生成，避免手动 Sprintf 出错)
func CacheKeyPostDetail(id uint) string {
	return fmt.Sprintf("forum:posts:%d", id)
}

// 动态 Key：用户 Session
func CacheKeyUserSession(userID uint) string {
	return fmt.Sprintf("forum:users:%d:session", userID)
}
