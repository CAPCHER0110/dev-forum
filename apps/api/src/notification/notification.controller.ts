import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { MailService } from '../mail/mail.service'; // 引入 MailService

@Controller()
export class NotificationController {
  constructor(private readonly mailService: MailService) {} // 注入
  
  // 监听 "post_created" 事件 (对应 Go 发送的 pattern)
  @EventPattern('post_created')
  async handlePostCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log(`📧 [Notification Service] 收到新帖通知: "${data.title}" (ID: ${data.postId})`);
    
    // 模拟发送邮件耗时操作
    // await new Promise(resolve => setTimeout(resolve, 2000));
    // 假设发给管理员，实际可以从数据库查订阅用户
    await this.mailService.sendPostNotification('admin@example.com', data.title, data.postId);

    console.log(`✅ [Notification Service] 邮件发送成功！`);

    // 手动确认消息 (如果配置了 noAck: false)
    // const channel = context.getChannelRef();
    // const originalMsg = context.getMessage();
    // channel.ack(originalMsg);
  }
}