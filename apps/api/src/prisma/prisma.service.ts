import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  // 可以在这里配置 log level，比如显示 SQL 查询
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.connectWithRetry();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // 自定义重试连接逻辑
  private async connectWithRetry(retries = 10, delay = 2000) {
    try {
      await this.$connect();
      this.logger.log('✅ Successfully connected to database');
    } catch (err) {
      if (retries > 0) {
        this.logger.warn(`❌ DB Connection failed. Retrying in ${delay}ms... (${retries} attempts left)`);
        this.logger.error(`Error details: ${err instanceof Error ? err.message : err}`);
        
        // 等待指定时间
        await new Promise((res) => setTimeout(res, delay));
        // 递归重试
        return this.connectWithRetry(retries - 1, delay * 1.5); // 1.5倍指数退避
      } else {
        this.logger.error('❌ Failed to connect to DB after multiple attempts. Exiting...');
        throw err;
      }
    }
  }
}

