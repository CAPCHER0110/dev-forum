// apps/go-api/internal/worker/notifier.go
package worker

import (
	"encoding/json"
	"fmt"
	"go-api/internal/config"
	"go-api/internal/mailer"
	"log"
	"time"
)

type PostMessage struct {
	Pattern string `json:"pattern"`
	Data    struct {
		PostID uint      `json:"postId"`
		Title  string    `json:"title"`
		Time   time.Time `json:"time"`
	} `json:"data"`
}

// 这是实际干脏活累活的函数
func HandleNewPost(msgBody []byte) {
	var msg PostMessage
	err := json.Unmarshal(msgBody, &msg)
	if err != nil {
		log.Printf("❌ 解析消息失败: %v", err)
		return
	}

	log.Printf("📥 [Go Worker] 收到新帖: ID=%d, Title=%s", msg.Data.PostID, msg.Data.Title)

	// 加载配置
	cfg := config.Load()

	// 使用配置的域名拼接 URL
	postURL := fmt.Sprintf("%s/posts/%d", cfg.App.FrontendURL, msg.Data.PostID)

	log.Printf("📧 [Go Worker] 正在发送邮件，帖子链接: %s", postURL)

	// 调用发邮件 (假设 SendPostNotification 内部已经有逻辑把 url 拼进去，或者我们需要修改该函数)
	// 如果 mailer.SendPostNotification 之前是接收 postId 自己拼 url 的，
	// 我们最好改成直接传 url，或者在 mailer 内部也读配置。
	// 为了解耦，建议修改 mailer.SendPostNotification 接收完整 url 或者在 worker 里拼好 HTML。

	// 这里我们假设之前 mailer.SendPostNotification 接收的是 postId。
	// 我们去修改 mailer 包让它更通用，或者在这里临时处理。
	// 最佳实践：修改 mailer 让它接收完整 Context。
	err = mailer.SendPostNotification(cfg.Mail, "admin@example.com", msg.Data.Title, postURL)
	if err != nil {
		log.Printf("❌ 邮件发送失败: %v", err)
	} else {
		log.Printf("✅ [Go Worker] 邮件发送成功!")
	}
}
