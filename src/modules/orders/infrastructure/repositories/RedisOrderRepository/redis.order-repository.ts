// src/order/infrastructure/redis-order.repository.ts
import { Injectable } from '@nestjs/common';
import { Order } from '../../../domain/entities/order';
import { OrderRepository } from '../../../domain/repositories/order-repository';
import { RepositoryError } from '../../../../../core/errors/repository.error';
import { Result } from '../../../../../core/domain/result';
import { CacheService } from '../../../../../core/infrastructure/redis/cache.service';
import { ErrorFactory } from '../../../../../core/errors/error.factory';
import { Order_REDIS } from '../../../../../core/infrastructure/redis/constants/redis.constants';

@Injectable()
export class RedisOrderRepository implements OrderRepository {
  constructor(
    private readonly cacheService: CacheService,
    private readonly postgresRepo: OrderRepository,
  ) {}

  async save(order: Order): Promise<Result<void, RepositoryError>> {
    try {
      // Save to Postgres first
      const saveResult = await this.postgresRepo.save(order);
      if (saveResult.isFailure) return saveResult;

      // Cache it
      await this.cacheService.set(
        `${Order_REDIS.CACHE_KEY}${order.id}`,
        order,
        { ttl: Order_REDIS.EXPIRATION },
      );

      return Result.success<void>(undefined);
    } catch (error) {
      return ErrorFactory.RepositoryError(`Failed to save order`, error);
    }
  }

  async update(order: Order): Promise<Result<void, RepositoryError>> {
    try {
      // Update in Postgres
      const updateResult = await this.postgresRepo.update(order);
      if (updateResult.isFailure) return updateResult;

      // Update in cache
      await this.cacheService.set(
        `${Order_REDIS.CACHE_KEY}${order.id}`,
        order,
        { ttl: Order_REDIS.EXPIRATION },
      );

      return Result.success<void>(undefined);
    } catch (error) {
      return ErrorFactory.RepositoryError(`Failed to update order`, error);
    }
  }

  async findById(id: number): Promise<Result<Order, RepositoryError>> {
    try {
      // Try cache first
      const cached = await this.cacheService.get<Order>(
        `${Order_REDIS.CACHE_KEY}${id}`,
      );
      if (cached) {
        return Result.success<Order>(cached);
      }

      // Fallback to Postgres
      const dbResult = await this.postgresRepo.findById(id);
      if (dbResult.isFailure) return dbResult;

      // Cache the result
      await this.cacheService.set(
        `${Order_REDIS.CACHE_KEY}${id}`,
        dbResult.value,
        { ttl: Order_REDIS.EXPIRATION },
      );

      return dbResult;
    } catch (error) {
      return ErrorFactory.RepositoryError(`Failed to find order`, error);
    }
  }

  async findAll(): Promise<Result<Order[], RepositoryError>> {
    try {
      // We could cache the list, but to avoid stale data let's go to Postgres
      const dbResult = await this.postgresRepo.findAll();
      if (dbResult.isFailure) return dbResult;

      // Optionally cache each order
      await Promise.all(
        dbResult.value.map((order) =>
          this.cacheService.set(`${Order_REDIS.CACHE_KEY}${order.id}`, order, {
            ttl: Order_REDIS.EXPIRATION,
          }),
        ),
      );

      return dbResult;
    } catch (error) {
      return ErrorFactory.RepositoryError(`Failed to find all orders`, error);
    }
  }

  async deleteById(id: number): Promise<Result<void, RepositoryError>> {
    try {
      // Delete from Postgres
      const deleteResult = await this.postgresRepo.deleteById(id);
      if (deleteResult.isFailure) return deleteResult;

      // Remove from cache
      await this.cacheService.delete(`${Order_REDIS.CACHE_KEY}${id}`);

      return Result.success<void>(undefined);
    } catch (error) {
      return ErrorFactory.RepositoryError(`Failed to delete order`, error);
    }
  }
}
