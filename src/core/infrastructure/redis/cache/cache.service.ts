import { Injectable } from '@nestjs/common';
import { FtSearchOptions } from 'redis';
import { RedisJsonClient } from '../commands/redis-json.client';
import { RedisKeyClient } from '../commands/redis-key.client';
import { RedisSearchClient } from '../commands/redis-search.client';
import { RedisService } from '../redis.service';

@Injectable()
export class CacheService {
  constructor(
    private readonly jsonCmd: RedisJsonClient,
    private readonly keyCmd: RedisKeyClient,
    private readonly searchCmd: RedisSearchClient,
    private readonly redisService: RedisService,
  ) {}

  async ttl(key: string): Promise<number> {
    return this.keyCmd.ttl(key);
  }

  async get<T>(key: string, path?: string): Promise<T | null> {
    const value = await this.jsonCmd.get(key, path);
    return value as unknown as T;
  }

  async getAll<T>(
    index: string,
    query: string = '*',
    options?: FtSearchOptions,
  ): Promise<T[]> {
    const values = await this.searchCmd.search(index, query, options);
    return values.documents.map((doc: any) => doc.value as T);
  }

  async set<T>(
    key: string,
    value: T,
    { path = '$', ttl = 3600 }: { path?: string; ttl?: number } = {},
  ): Promise<void> {
    await this.jsonCmd.set(key, path, value as any);
    await this.keyCmd.expire(key, ttl);
  }

  async setAll(
    entries: { key: string; value: any }[],
    { path = '$', ttl = 3600 }: { path?: string; ttl?: number } = {},
  ): Promise<void> {
    const pipeline = this.keyCmd.createPipeline();

    for (const { key, value } of entries) {
      const fullKey = this.redisService.getFullKey(key);
      pipeline.json.set(fullKey, path, value);
      if (ttl) {
        pipeline.expire(fullKey, ttl);
      }
    }

    await pipeline.exec();
  }

  async merge<T>(
    key: string,
    partial: Partial<T>,
    { path = '$', ttl = 3600 }: { path?: string; ttl?: number } = {},
  ): Promise<T | null> {
    await this.jsonCmd.merge(key, path, partial as any);
    if (ttl) {
      await this.keyCmd.expire(key, ttl);
    }
    return this.get<T>(key);
  }

  async mergeAll(
    entries: { key: string; value: any }[],
    { path = '$', ttl = 3600 }: { path?: string; ttl?: number } = {},
  ): Promise<void> {
    const pipeline = this.keyCmd.createPipeline();

    for (const { key, value } of entries) {
      const fullKey = this.redisService.getFullKey(key);
      pipeline.json.merge(fullKey, path, value);
      if (ttl) {
        pipeline.expire(fullKey, ttl);
      }
    }

    await pipeline.exec();
  }

  async delete(key: string): Promise<void> {
    await this.jsonCmd.del(key);
  }

  async search<T>(
    index: string,
    query: string,
    options?: FtSearchOptions,
  ): Promise<T[]> {
    const result = await this.searchCmd.search(index, query, options);
    return result.documents.map((doc: any) => doc.value as T);
  }

  async scanKeys(pattern: string, count = 100): Promise<string[]> {
    return this.keyCmd.scanKeys(pattern, count);
  }
}
