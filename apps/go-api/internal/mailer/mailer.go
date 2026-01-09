package mailer

import (
	"crypto/tls"
	"fmt"
	"go-api/internal/config"

	"gopkg.in/gomail.v2"
)

func SendPostNotification(cfg config.MailConfig, toEmail, title string, postURL string) error {
	m := gomail.NewMessage()
	m.SetHeader("From", cfg.From)
	m.SetHeader("To", toEmail)
	m.SetHeader("Subject", "新帖发布通知: "+title)

	body := fmt.Sprintf(`
		<p>Hi there,</p>
		<p>Go后端通知您，有新帖子发布了：<b>%s</b></p>
		<p><a href="%s">点击查看</a></p>
	`, title, postURL)

	m.SetBody("text/html", body)

	// 如果是 Mailhog (通常端口 1025)，或者没配密码，就不走认证
	// gomail.NewDialer 如果 user/pass 为空，就不会触发 PlainAuth，也就不会报 "unencrypted connection"
	var d *gomail.Dialer
	if cfg.Port == 1025 || cfg.Pass == "" {
		d = gomail.NewDialer(cfg.Host, cfg.Port, "", "")
	} else {
		d = gomail.NewDialer(cfg.Host, cfg.Port, cfg.User, cfg.Pass)
	}

	// 允许跳过 TLS 验证 (针对自签名证书的真实 SMTP，对 Mailhog 其实没用因为根本没 TLS)
	d.TLSConfig = &tls.Config{InsecureSkipVerify: true}

	return d.DialAndSend(m)
}
