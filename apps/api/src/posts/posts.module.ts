import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService} from './posts.service';
import { PrismaService } from '../prisma/prisma.service'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'NOTIFICATION_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URI') || 'amqp://user:password@rabbitmq:5672'],
            // 从配置读取队列名
            queue: configService.get<string>('RABBITMQ_QUEUE') || 'new_post_queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
    ]),
  ],
  controllers: [PostsController],
  providers: [PostsService, PrismaService]
})
export class PostsModule {}
