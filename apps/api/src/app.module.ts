import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { CacheConfigModule } from './common/cache/cache-config.module'
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggerModule } from 'nestjs-pino';
import { v4 as uuidv4 } from 'uuid';
import { UploadModule } from './upload/upload.module';
import { NotificationModule } from './notification/notification.module';
import { NotificationController } from './notification/notification.controller';
import { PaymentModule } from './payment/payment.module'
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    PostsModule, 
    AuthModule, 
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule.forRoot({
      type: 'single',
      url: process.env.REDIS_URL || 'redis://redis:6379',
      options: {
        // 无限重试策略
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay; 
        },
        // 防止 DNS 解析失败导致的立即崩溃
        reconnectOnError: (err) => {
          const targetError = 'READONLY';
          if (err.message.includes(targetError)) {
            return true;
          }
          return false;
        },
      },
    }),
    CacheConfigModule,
    LoggerModule.forRoot({
      pinoHttp: {
        // 配置 Trace ID (LogID)
        // 自动为每个请求生成唯一 ID，如果没有 X-Request-Id 头，就生成一个新的
        genReqId: (req) => {
          const id = req.headers['x-request-id'] || req.headers['x-log-id'] || uuidv4();
          return id.toString();
        },

        // 配置日志格式和输出
        // 在开发环境用 pretty print，生产环境建议用 JSON
        // 下面演示如何同时输出到控制台(stdout)和文件
        transport: {
          targets: [
            // 目标 1: 控制台 (开发时好看，生产时建议关掉 pretty)
            {
              target: 'pino-pretty',
              options: {
                translateTime: 'SYS:standard',
                singleLine: true,
              },
            },
            // 目标 2: 文件 (追加写入)
            {
              target: 'pino/file',
              options: {
                destination: './logs/app.log', // 日志路径，记得在 docker-compose 挂载 volume
                mkdir: true, // 自动创建目录
              },
            },
          ],
        },
        
        // 设置日志级别
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        
        // 自动注入 trace_id 到响应头
        autoLogging: true,
      },
    }),
    UploadModule,
    NotificationModule,
    // 注册 PaymentModule
    PaymentModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    PrismaService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
