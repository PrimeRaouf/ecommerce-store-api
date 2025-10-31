import { Module } from '@nestjs/common';
import { CartsController } from './carts.controller';
import { AddCartItemController } from './presentation/controllers/add-cart-item/add-cart-item.controller';
import { ClearCartController } from './presentation/controllers/clear-cart/clear-cart.controller';
import { CreateCartController } from './presentation/controllers/create-cart/create-cart.controller';
import { GetCartController } from './presentation/controllers/get-cart/get-cart.controller';
import { MergeCartsController } from './presentation/controllers/merge-carts/merge-carts.controller';
import { RemoveCartItemController } from './presentation/controllers/remove-cart-item/remove-cart-item.controller';
import { UpdateCartItemController } from './presentation/controllers/update-cart-item/update-cart-item.controller';

@Module({
  controllers: [CartsController],
  providers: [
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
