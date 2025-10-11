// src/modules/orders/application/usecases/get-order/get-order.usecase.spec.ts
import { OrderRepository } from '../../../domain/repositories/order-repository';
import {
  Result,
  isFailure,
  isSuccess,
} from '../../../../../core/domain/result';
import { ErrorFactory } from '../../../../../core/errors/error.factory';
import { UseCaseError } from '../../../../../core/errors/usecase.error';
import { GetOrderUseCase } from './get-order.usecase';
import { IOrder } from '../../../domain/interfaces/order.interface';
import { OrderStatus } from '../../../domain/value-objects/order-status';
import { PaymentMethod } from '../../../domain/value-objects/payment-method';
import { PaymentStatus } from '../../../domain/value-objects/payment-status';
import { Order } from '../../../domain/entities/order';

describe('GetOrderUseCase', () => {
  let useCase: GetOrderUseCase;
  let mockOrderRepository: jest.Mocked<OrderRepository>;
  let mockOrder: IOrder;
  let orderId: string;

  beforeEach(() => {
    mockOrderRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      updateItemsInfo: jest.fn(),
      deleteById: jest.fn(),
      listOrders: jest.fn(),
      cancelOrder: jest.fn(),
    } as any;

    orderId = 'OR0000001';

    mockOrder = {
      id: orderId,
      customerId: 'CU0000001',
      paymentInfoId: 'PAY001',
      shippingAddressId: 'ADDR001',

      items: [
        {
          id: 'item-1',
          productId: 'PR0000001',
          productName: 'Expensive Item',
          quantity: 1,
          unitPrice: 10,
          lineTotal: 10,
        },
      ],

      customerInfo: {
        customerId: 'CU0000001',
        email: 'customer@example.com',
        phone: '+1234567890',
        firstName: 'John',
        lastName: 'Doe',
      },

      paymentInfo: {
        id: 'PAY001',
        method: PaymentMethod.CREDIT_CARD,
        amount: 15,
        status: PaymentStatus.PENDING,
        transactionId: 'TXN123456',
        notes: 'Awaiting payment confirmation',
      },

      shippingAddress: {
        id: 'ADDR001',
        firstName: 'John',
        lastName: 'Doe',
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'DZ',
        phone: '+1234567890',
      },

      subtotal: 10,
      shippingCost: 5,
      totalPrice: 15,

      status: OrderStatus.PENDING,
      createdAt: new Date('2025-01-01T10:00:00Z'),
      updatedAt: new Date('2025-01-02T10:00:00Z'),

      customerNotes: 'Please ring doorbell upon delivery',
    };

    useCase = new GetOrderUseCase(mockOrderRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return Success with order when order is found', async () => {
      // Arrange
      const domainOrder = Order.fromPrimitives(mockOrder);
      const expectedPrimitives = domainOrder.toPrimitives();

      mockOrderRepository.findById.mockResolvedValue(
        Result.success(domainOrder),
      );

      // Act
      const result = await useCase.execute(orderId);

      // Assert
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        // Compare with the primitives produced by the domain object to avoid
        // brittle differences introduced by normalizations inside Order
        expect(result.value).toEqual(expectedPrimitives);
        expect(result.value.id).toBe(orderId);
        expect(result.value.customerId).toBe(expectedPrimitives.customerId);
        expect(result.value.status).toBe(OrderStatus.PENDING);
        expect(result.value.items).toHaveLength(
          expectedPrimitives.items.length,
        );
      }
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(orderId);
      expect(mockOrderRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should return Failure with UseCaseError when order is not found', async () => {
      // Arrange
      const repositoryError = ErrorFactory.RepositoryError(
        `Order with id ${orderId} not found`,
      );
      mockOrderRepository.findById.mockResolvedValue(repositoryError);

      // Act
      const result = await useCase.execute(orderId);

      // Assert
      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(UseCaseError);
        expect(result.error.message).toBe(`Order with id ${orderId} not found`);
      }
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(orderId);
      expect(mockOrderRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should return Failure with UseCaseError when repository throws unexpected error', async () => {
      // Arrange
      const repoError = new Error('Database connection failed');
      mockOrderRepository.findById.mockRejectedValue(repoError);

      // Act
      const result = await useCase.execute(orderId);

      // Assert
      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(UseCaseError);
        expect(result.error.message).toBe('Unexpected use case error');
        expect(result.error.cause).toBe(repoError);
      }
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(orderId);
      expect(mockOrderRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should handle empty order ID gracefully', async () => {
      // Arrange
      const emptyId = '';
      const repositoryError = ErrorFactory.RepositoryError(
        `Order with id ${emptyId} not found`,
      );
      mockOrderRepository.findById.mockResolvedValue(repositoryError);

      // Act
      const result = await useCase.execute(emptyId);

      // Assert
      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(UseCaseError);
        expect(result.error.message).toBe(`Order with id ${emptyId} not found`);
      }
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(emptyId);
    });

    it('should handle null/undefined order ID', async () => {
      // Arrange
      const nullId = null as any;
      const repositoryError = ErrorFactory.RepositoryError(
        `Order with id ${nullId} not found`,
      );
      mockOrderRepository.findById.mockResolvedValue(repositoryError);

      // Act
      const result = await useCase.execute(nullId);

      // Assert
      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(UseCaseError);
        expect(result.error.message).toBe(`Order with id ${nullId} not found`);
      }
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(nullId);
    });

    it('should return order with correct properties (explicit sample)', async () => {
      // Arrange - use a concrete sample and rely on domain normalization
      const sample: IOrder = {
        id: orderId,
        customerId: 'CU0000001',
        paymentInfoId: 'PAY001',
        shippingAddressId: 'ADDR001',
        items: [
          {
            id: 'item-1',
            productId: 'PR0000001',
            productName: 'Expensive Item',
            quantity: 1,
            unitPrice: 10,
            lineTotal: 10,
          },
        ],
        customerInfo: {
          customerId: 'CU0000001',
          email: 'customer@example.com',
          phone: '+1234567890',
          firstName: 'John',
          lastName: 'Doe',
        },
        paymentInfo: {
          id: 'PAY001',
          method: PaymentMethod.CREDIT_CARD,
          amount: 15,
          status: PaymentStatus.PENDING,
          transactionId: 'TXN123456',
          notes: 'Awaiting payment confirmation',
        },
        shippingAddress: {
          id: 'ADDR001',
          firstName: 'John',
          lastName: 'Doe',
          street: '123 Main Street',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'DZ',
          phone: '+1234567890',
        },
        subtotal: 10,
        shippingCost: 5,
        totalPrice: 15,
        status: OrderStatus.PENDING,
        createdAt: new Date('2025-01-01T10:00:00Z'),
        updatedAt: new Date('2025-01-02T10:00:00Z'),
        customerNotes: 'Please ring doorbell upon delivery',
      };

      const domainOrder = Order.fromPrimitives(sample);
      mockOrderRepository.findById.mockResolvedValue(
        Result.success(domainOrder),
      );

      // Act
      const result = await useCase.execute(orderId);

      // Assert
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        const order = result.value;
        const expected = domainOrder.toPrimitives();
        expect(order).toEqual(expected);
        // spot checks
        expect(order.id).toBe(orderId);
        expect(order.customerId).toBe('CU0000001');
        expect(order.totalPrice).toBe(expected.totalPrice);
        expect(order.items).toHaveLength(1);
        expect(order.items[0].productId).toBe('PR0000001');
      }
    });

    it('should return order data correctly for multiple items', async () => {
      const multi: IOrder = {
        id: orderId,
        customerId: 'CU0000001',
        paymentInfoId: 'PAY001',
        shippingAddressId: 'ADDR001',
        items: [
          {
            id: 'item-1',
            productId: 'PR0000001',
            productName: 'Expensive Item',
            quantity: 1,
            unitPrice: 10,
            lineTotal: 10,
          },
          {
            id: 'item-2',
            productId: 'PR0000002',
            productName: 'Another Item',
            quantity: 2,
            unitPrice: 20,
            lineTotal: 40,
          },
        ],
        customerInfo: {
          customerId: 'CU0000001',
          email: 'customer@example.com',
          phone: '+1234567890',
          firstName: 'John',
          lastName: 'Doe',
        },
        paymentInfo: {
          id: 'PAY001',
          method: PaymentMethod.CREDIT_CARD,
          amount: 65,
          status: PaymentStatus.PENDING,
          transactionId: 'TXN123456',
          notes: 'Awaiting payment confirmation',
        },
        shippingAddress: {
          id: 'ADDR001',
          firstName: 'John',
          lastName: 'Doe',
          street: '123 Main Street',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'DZ',
          phone: '+1234567890',
        },
        subtotal: 50,
        shippingCost: 15,
        totalPrice: 65,
        status: OrderStatus.PENDING,
        createdAt: new Date('2025-01-01T10:00:00Z'),
        updatedAt: new Date('2025-01-01T10:00:00Z'),
        customerNotes: 'Please ring doorbell upon delivery',
      };

      const domainOrder = Order.fromPrimitives(multi);
      mockOrderRepository.findById.mockResolvedValue(
        Result.success(domainOrder),
      );

      // Act
      const result = await useCase.execute(orderId);

      // Assert
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        const order = result.value;
        const expected = domainOrder.toPrimitives();
        expect(order).toEqual(expected);
        expect(order.items).toHaveLength(2);
        expect(order.totalPrice).toBe(expected.totalPrice);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle repository returning different error types', async () => {
      // Test with different repository error types (rejection)
      const customError = new Error('Custom repository error');
      customError.name = 'CustomRepositoryError';
      mockOrderRepository.findById.mockRejectedValue(customError);

      const result = await useCase.execute(orderId);

      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(UseCaseError);
        expect(result.error.message).toBe('Unexpected use case error');
        expect(result.error.cause).toBe(customError);
      }
    });

    it('should handle very long order IDs', async () => {
      const longId = 'OR' + '0'.repeat(1000);
      const repositoryError = ErrorFactory.RepositoryError(
        `Order with id ${longId} not found`,
      );
      mockOrderRepository.findById.mockResolvedValue(repositoryError);

      const result = await useCase.execute(longId);

      expect(isFailure(result)).toBe(true);
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(longId);
    });
  });
});
