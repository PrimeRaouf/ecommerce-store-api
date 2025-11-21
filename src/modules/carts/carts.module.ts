import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartsController } from './carts.controller';
import { AddCartItemController } from './presentation/controllers/add-cart-item/add-cart-item.controller';
import { ClearCartController } from './presentation/controllers/clear-cart/clear-cart.controller';
import { CreateCartController } from './presentation/controllers/create-cart/create-cart.controller';
import { GetCartController } from './presentation/controllers/get-cart/get-cart.controller';
import { MergeCartsController } from './presentation/controllers/merge-carts/merge-carts.controller';
import { RemoveCartItemController } from './presentation/controllers/remove-cart-item/remove-cart-item.controller';
import { UpdateCartItemController } from './presentation/controllers/update-cart-item/update-cart-item.controller';
import { CartEntity } from './infrastructure/orm/cart.schema';
import { CartItemEntity } from './infrastructure/orm/cart-item.schema';
import { RedisModule } from '../../core/infrastructure/redis/redis.module';
import { CoreModule } from '../../core/core.module';
import { POSTGRES_CART_REPOSITORY, REDIS_CART_REPOSITORY } from './carts.token';
import { PostgresCartRepository } from './infrastructure/repositories/postgres-cart-repository/postgres.cart-repository';
import { RedisCartRepository } from './infrastructure/repositories/redis-cart-repository/redis.cart-repository';
import { CacheService } from '../../core/infrastructure/redis/cache/cache.service';
import { CartRepository } from './domain/repositories/cart.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartEntity, CartItemEntity]),
    RedisModule,
    CoreModule,
  ],
  controllers: [CartsController],
  providers: [
    // Postgres Repo
    {
      provide: POSTGRES_CART_REPOSITORY,
      useClass: PostgresCartRepository,
    },

    // Redis Repo (decorator around Postgres)
    {
      provide: REDIS_CART_REPOSITORY,
      useFactory: (
        cacheService: CacheService,
        postgresRepo: PostgresCartRepository,
      ) => {
        return new RedisCartRepository(
          cacheService,
          postgresRepo,
          new Logger(RedisCartRepository.name),
        );
      },
      inject: [CacheService, POSTGRES_CART_REPOSITORY],
    },

    // Default Repository Binding
    {
      provide: CartRepository,
      useExisting: REDIS_CART_REPOSITORY,
    },

    // Controllers
    GetCartController,
    CreateCartController,
    AddCartItemController,
    UpdateCartItemController,
    RemoveCartItemController,
    ClearCartController,
    MergeCartsController,
  ],
})
export class CartsModule {}
