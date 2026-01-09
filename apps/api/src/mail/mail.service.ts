import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendPostNotification(email: string, title: string, postId: number) {
    // 从配置读取前端域名
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const url = `${frontendUrl}/posts/${postId}`;

    await this.mailerService.sendMail({
      to: email,
      subject: '新帖发布通知: ' + title,
      template: './post-notification', // 对应 templates/post-notification.hbs
      context: { // 传递给模板的数据
        title,
        url,
        name: email.split('@')[0],
      },
    });
  }
}