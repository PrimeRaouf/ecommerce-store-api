import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { GetOrderController } from './presentation/controllers/GetOrder/get-order.controller';
import { CreateOrderController } from './presentation/controllers/CreateOrder/create-order.controller';
import { CreateOrderDto } from './presentation/dto/create-order.dto';
import { OrderStatus } from './domain/value-objects/order-status';
import { IOrder } from './domain/interfaces/IOrder';
import { ListOrdersController } from './presentation/controllers/ListOrders/list-orders.controller';

describe('OrdersController', () => {
  let controller: OrdersController;
  let createOrderController: CreateOrderController;
  let getOrderController: GetOrderController;
  let listOrdersController: ListOrdersController;

  let id: string;
  let mockOrder: IOrder;
  let mockCreateOrderDto: CreateOrderDto;

  beforeEach(async () => {
    mockOrder = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      customerId: 'customer-123',
      items: [
        {
          id: 'item-1',
          productId: 'product-1',
          productName: 'Test Product',
          quantity: 2,
          unitPrice: 10.5,
          lineTotal: 21.0,
        },
      ],
      status: OrderStatus.PENDING,
      totalPrice: 21.0,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
    } as IOrder;

    mockCreateOrderDto = {
      customerId: 'customer-123',
      items: [
        {
          productId: 'product-1',
          quantity: 2,
        },
      ],
      status: OrderStatus.PENDING,
    } as CreateOrderDto;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: CreateOrderController,
          useValue: {
            handle: jest.fn().mockResolvedValue(mockOrder),
          },
        },
        {
          provide: GetOrderController,
          useValue: {
            handle: jest.fn().mockResolvedValue(mockOrder),
          },
        },
        {
          provide: ListOrdersController,
          useValue: {
            handle: jest.fn().mockResolvedValue([mockOrder]),
          },
        },
      ],
    }).compile();

    id = 'OR00000001';

    controller = module.get<OrdersController>(OrdersController);
    createOrderController = module.get<CreateOrderController>(
      CreateOrderController,
    );
    getOrderController = module.get<GetOrderController>(GetOrderController);
    listOrdersController =
      module.get<ListOrdersController>(ListOrdersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call CreateOrderController.handle when createOrder is called and return its result', async () => {
    const res = await controller.createOrder(mockCreateOrderDto);
    expect(createOrderController.handle).toHaveBeenCalledWith(
      mockCreateOrderDto,
    );
    expect(res).toEqual(mockOrder);
  });

  it('should call GetOrderController.handle when findOne is called and return its result', async () => {
    const res = await controller.findOne(id);
    expect(getOrderController.handle).toHaveBeenCalledWith(id);
    expect(res).toEqual(mockOrder);
  });

  it('should call ListOrdersController.handle when findAll is called and return its result', async () => {
    const query = {} as any;
    const res = await controller.findAll(query);
    expect(listOrdersController.handle).toHaveBeenCalledWith(query);
    expect(res).toEqual([mockOrder]);
  });
});
