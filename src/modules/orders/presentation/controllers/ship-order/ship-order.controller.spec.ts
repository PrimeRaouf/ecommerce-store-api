// src/modules/orders/presentation/controllers/ship-order/ship-order.controller.spec.ts
import { ShipOrderController } from './ship-order.controller';
import { ShipOrderUseCase } from '../../../application/usecases/ship-order/ship-order.usecase';
import { OrderTestFactory } from '../../../testing/factories/order.factory';
import {
  isFailure,
  isSuccess,
  Result,
} from '../../../../../core/domain/result';
import { ErrorFactory } from '../../../../../core/errors/error.factory';
import { ControllerError } from '../../../../../core/errors/controller.error';
import { OrderStatus } from '../../../domain/value-objects/order-status';
import { UseCaseError } from '../../../../../core/errors/usecase.error';

describe('ShipOrderController', () => {
  let controller: ShipOrderController;
  let mockShipOrderUseCase: jest.Mocked<ShipOrderUseCase>;

  beforeEach(() => {
    mockShipOrderUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ShipOrderUseCase>;

    controller = new ShipOrderController(mockShipOrderUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle', () => {
    it('should return success if order is shipped', async () => {
      const shippedOrder = OrderTestFactory.createShippedOrder();

      mockShipOrderUseCase.execute.mockResolvedValue(
        Result.success(shippedOrder),
      );

      const result = await controller.handle(shippedOrder.id);

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value).toBe(shippedOrder);
        expect(result.value.status).toBe(OrderStatus.SHIPPED);
      }
      expect(mockShipOrderUseCase.execute).toHaveBeenCalledWith(
        shippedOrder.id,
      );
      expect(mockShipOrderUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should return Failure(UseCaseError) if order shipping fails', async () => {
      const orderId = 'OR0001';

      mockShipOrderUseCase.execute.mockResolvedValue(
        Result.failure(
          ErrorFactory.UseCaseError('Order is not in a shippable state').error,
        ),
      );

      const result = await controller.handle(orderId);

      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(UseCaseError);
        expect(result.error.message).toBe('Order is not in a shippable state');
      }

      expect(mockShipOrderUseCase.execute).toHaveBeenCalledWith(orderId);
      expect(mockShipOrderUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should return Failure(UseCaseError) if order not found', async () => {
      const orderId = 'OR9999';

      mockShipOrderUseCase.execute.mockResolvedValue(
        Result.failure(
          ErrorFactory.UseCaseError('Order with id OR9999 not found').error,
        ),
      );

      const result = await controller.handle(orderId);

      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(UseCaseError);
        expect(result.error.message).toContain('not found');
      }
    });

    it('should return Failure(ControllerError) if usecase throws unexpected error', async () => {
      const orderId = 'OR0001';
      const error = new Error('Database connection failed');

      mockShipOrderUseCase.execute.mockRejectedValue(error);

      const result = await controller.handle(orderId);

      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(ControllerError);
        expect(result.error.message).toBe('Unexpected Controller Error');
        expect(result.error.cause).toBe(error);
      }

      expect(mockShipOrderUseCase.execute).toHaveBeenCalledWith(orderId);
      expect(mockShipOrderUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should ship order with COD payment', async () => {
      const codOrder = OrderTestFactory.createCashOnDeliveryOrder({
        status: OrderStatus.PROCESSING,
      });
      const shippedCOD = {
        ...codOrder,
        status: OrderStatus.SHIPPED,
      };

      mockShipOrderUseCase.execute.mockResolvedValue(
        Result.success(shippedCOD),
      );

      const result = await controller.handle(codOrder.id);

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value.paymentInfo.method).toBe('cash_on_delivery');
        expect(result.value.status).toBe(OrderStatus.SHIPPED);
      }
    });

    it('should ship order with completed online payment', async () => {
      const onlineOrder = OrderTestFactory.createStripeOrder({
        status: OrderStatus.PROCESSING,
        paymentInfo: {
          ...OrderTestFactory.createMockOrder().paymentInfo,
          method: 'stripe' as any,
          status: 'completed' as any,
          paidAt: new Date(),
        },
      });
      const shippedOnline = {
        ...onlineOrder,
        status: OrderStatus.SHIPPED,
      };

      mockShipOrderUseCase.execute.mockResolvedValue(
        Result.success(shippedOnline),
      );

      const result = await controller.handle(onlineOrder.id);

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value.paymentInfo.status).toBe('completed');
        expect(result.value.status).toBe(OrderStatus.SHIPPED);
      }
    });

    it('should fail to ship order in PENDING status', async () => {
      const pendingOrder = OrderTestFactory.createPendingOrder();

      mockShipOrderUseCase.execute.mockResolvedValue(
        Result.failure(
          ErrorFactory.UseCaseError('Order is not in a shippable state').error,
        ),
      );

      const result = await controller.handle(pendingOrder.id);

      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error.message).toBe('Order is not in a shippable state');
      }
    });

    it('should fail to ship order in CONFIRMED status', async () => {
      const confirmedOrder = OrderTestFactory.createConfirmedOrder();

      mockShipOrderUseCase.execute.mockResolvedValue(
        Result.failure(
          ErrorFactory.UseCaseError('Order is not in a shippable state').error,
        ),
      );

      const result = await controller.handle(confirmedOrder.id);

      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error.message).toBe('Order is not in a shippable state');
      }
    });

    it('should ship multi-item order', async () => {
      const multiItemOrder = OrderTestFactory.createMultiItemOrder(3);
      const processingMultiItem = {
        ...multiItemOrder,
        status: OrderStatus.PROCESSING,
        paymentInfo: {
          ...multiItemOrder.paymentInfo,
          status: 'completed' as any,
          paidAt: new Date(),
        },
      };
      const shippedMultiItem = {
        ...processingMultiItem,
        status: OrderStatus.SHIPPED,
      };

      mockShipOrderUseCase.execute.mockResolvedValue(
        Result.success(shippedMultiItem),
      );

      const result = await controller.handle(processingMultiItem.id);

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value.items).toHaveLength(3);
        expect(result.value.status).toBe(OrderStatus.SHIPPED);
      }
    });

    it('should fail to ship already shipped order', async () => {
      const shippedOrder = OrderTestFactory.createShippedOrder();

      mockShipOrderUseCase.execute.mockResolvedValue(
        Result.failure(
          ErrorFactory.UseCaseError('Order is not in a shippable state').error,
        ),
      );

      const result = await controller.handle(shippedOrder.id);

      expect(isFailure(result)).toBe(true);
    });

    it('should fail to ship delivered order', async () => {
      const deliveredOrder = OrderTestFactory.createDeliveredOrder();

      mockShipOrderUseCase.execute.mockResolvedValue(
        Result.failure(
          ErrorFactory.UseCaseError('Order is not in a shippable state').error,
        ),
      );

      const result = await controller.handle(deliveredOrder.id);

      expect(isFailure(result)).toBe(true);
    });

    it('should fail to ship cancelled order', async () => {
      const cancelledOrder = OrderTestFactory.createCancelledOrder();

      mockShipOrderUseCase.execute.mockResolvedValue(
        Result.failure(
          ErrorFactory.UseCaseError('Order is not in a shippable state').error,
        ),
      );

      const result = await controller.handle(cancelledOrder.id);

      expect(isFailure(result)).toBe(true);
    });
  });
});
