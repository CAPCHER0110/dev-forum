import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    // 配置 JWT
    JwtModule.registerAsync({
      global: true, // 保持全局可用
      inject: [ConfigService], // 告诉 NestJS：这里需要注入 ConfigService
      // 工厂函数：等 ConfigService 注入好了，再执行这个函数返回配置
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // 从 .env 读取
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
