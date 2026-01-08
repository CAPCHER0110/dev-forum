import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CacheKeyService {
  constructor(private configService: ConfigService) {}

  // 获取统一前缀，例如 "dev:forum"
  private get prefix(): string {
    const env = this.configService.get<string>('APP_ENV', 'local');
    const appName = 'forum';
    return `${env}:${appName}`;
  }

  // 帖子列表 Key
  get postsListKey(): string {
    return `${this.prefix}:posts:list`;
  }

  // 帖子详情 Key (预留)
  getPostDetailKey(id: number): string {
    return `${this.prefix}:posts:${id}`;
  }

  // 用户 Session Key (预留)
  getUserSessionKey(userId: number): string {
    return `${this.prefix}:users:${userId}:session`;
  }
}