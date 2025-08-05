import { Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { RedisIndexInitializerService } from './redis.index-initializer';
import { RedisService } from './redis.service';

@Module({
  exports: [CacheService],
  providers: [RedisService, RedisIndexInitializerService, CacheService],
})
export class RedisModule {}
