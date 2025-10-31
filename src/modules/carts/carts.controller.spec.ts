import { Test, TestingModule } from '@nestjs/testing';
import { CartsController } from './carts.controller';
import { AddCartItemController } from './presentation/controllers/add-cart-item/add-cart-item.controller';
import { ClearCartController } from './presentation/controllers/clear-cart/clear-cart.controller';
import { CreateCartController } from './presentation/controllers/create-cart/create-cart.controller';
import { GetCartController } from './presentation/controllers/get-cart/get-cart.controller';
import { MergeCartsController } from './presentation/controllers/merge-carts/merge-carts.controller';
import { RemoveCartItemController } from './presentation/controllers/remove-cart-item/remove-cart-item.controller';
import { UpdateCartItemController } from './presentation/controllers/update-cart-item/update-cart-item.controller';

describe('CartsController', () => {
  let controller: CartsController;

  let getCartController: GetCartController;
  let createCartController: CreateCartController;
  let addCartItemController: AddCartItemController;
  let updateCartItemController: UpdateCartItemController;
  let removeCartItemController: RemoveCartItemController;
  let clearCartController: ClearCartController;
  let mergeCartsController: MergeCartsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartsController],
      providers: [
        {
          provide: GetCartController,
          useValue: {
            handle: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: CreateCartController,
          useValue: {
            handle: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: AddCartItemController,
          useValue: {
            handle: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: UpdateCartItemController,
          useValue: {
            handle: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: RemoveCartItemController,
          useValue: {
            handle: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: ClearCartController,
          useValue: {
            handle: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: MergeCartsController,
          useValue: {
            handle: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<CartsController>(CartsController);

    getCartController = module.get<GetCartController>(GetCartController);
    createCartController =
      module.get<CreateCartController>(CreateCartController);
    addCartItemController = module.get<AddCartItemController>(
      AddCartItemController,
    );
    updateCartItemController = module.get<UpdateCartItemController>(
      UpdateCartItemController,
    );
    removeCartItemController = module.get<RemoveCartItemController>(
      RemoveCartItemController,
    );
    clearCartController = module.get<ClearCartController>(ClearCartController);
    mergeCartsController =
      module.get<MergeCartsController>(MergeCartsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
