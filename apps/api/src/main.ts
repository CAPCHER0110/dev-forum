import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create(
    AppModule, { 
      bufferLogs: true,
      rawBody: true,
     }
  );
  app.useLogger(app.get(Logger)); // 替换默认 Logger
  app.useGlobalInterceptors(new TransformInterceptor());
  // app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe()); // 开启全局参数校验
  // await app.listen(process.env.PORT ?? 3000);
  app.enableCors(); // 允许跨域，这是开发阶段最粗暴有效的办法

  // 这里的配置通常直接从 process.env 读取，
  // 因为 ConfigService 在 app 创建完之前还不太好拿（虽然也能拿，但这样更简单）
  const rmqUrl = process.env.RABBITMQ_URI || 'amqp://user:password@rabbitmq:5672';
  const queueName = process.env.RABBITMQ_QUEUE || 'new_post_queue'; 

  // 连接 RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rmqUrl],
      queue: queueName, // 监听同一个队列
      queueOptions: {
        durable: true,
      },
    },
  });

  // 启动微服务监听
  await app.startAllMicroservices();

  await app.listen(4000); // 把后端改到 4000 端口
}
bootstrap();
