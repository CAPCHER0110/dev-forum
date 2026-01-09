package mq

import (
	"context"
	"encoding/json"
	"log/slog"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

type RabbitMQ struct {
	conn      *amqp.Connection
	channel   *amqp.Channel
	queueName string
	url       string
}

func NewRabbitMQ(url string, queueName string) (*RabbitMQ, error) {
	conn, err := amqp.Dial(url)
	if err != nil {
		return nil, err
	}

	ch, err := conn.Channel()
	if err != nil {
		return nil, err
	}

	// 声明队列 (确保队列存在)
	_, err = ch.QueueDeclare(
		queueName, // 队列名
		true,      // durable (持久化)
		false,     // delete when unused
		false,     // exclusive
		false,     // no-wait
		nil,       // arguments
	)
	if err != nil {
		return nil, err
	}

	return &RabbitMQ{
		conn:      conn,
		channel:   ch,
		queueName: queueName,
	}, nil
}

func (r *RabbitMQ) PublishNewPost(postID uint, title string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	body, _ := json.Marshal(map[string]interface{}{
		"pattern": "post_created", // NestJS Microservice 默认匹配模式
		"data": map[string]interface{}{
			"postId": postID,
			"title":  title,
			"time":   time.Now(),
		},
	})

	err := r.channel.PublishWithContext(ctx,
		"",          // exchange
		r.queueName, // routing key (队列名)
		false,       // mandatory
		false,       // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		})

	if err != nil {
		slog.Info("❌ RabbitMQ Publish Failed:", "err", err)
		return err
	}
	slog.Info("✅ RabbitMQ Sent:", "title", title)
	return nil
}

// 消费方法
func (r *RabbitMQ) StartConsumer(handler func(msg []byte)) {
	msgs, err := r.channel.Consume(
		r.queueName, // 队列名
		"",          // consumer name (留空自动生成)
		true,        // auto-ack (自动确认收到)
		false,       // exclusive
		false,       // no-local
		false,       // no-wait
		nil,         // args
	)
	if err != nil {
		slog.Info("❌ Failed to register a consumer:", "err", err)
		return
	}

	// 开启一个协程一直从 channel 里读数据
	go func() {
		slog.Info("🎧 RabbitMQ Consumer Started... Waiting for messages.")
		for d := range msgs {
			// 调用传入的处理函数
			handler(d.Body)
		}
	}()
}

func (r *RabbitMQ) Close() {
	r.channel.Close()
	r.conn.Close()
}
