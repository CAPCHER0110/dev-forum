// src/common/cache/cache-config.module.ts
import { Global, Module } from '@nestjs/common';
import { CacheKeyService } from './cache-key.service';

@Global() // 设为全局，其他模块直接用，不用再 import
@Module({
  providers: [CacheKeyService],
  exports: [CacheKeyService],
})
export class CacheConfigModule {}