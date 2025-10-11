import { CancelOrderUseCase } from './cancel-order.usecase';
import { OrderRepository } from '../../../domain/repositories/order-repository';
import { Result } from '../../../../../core/domain/result';
import { RepositoryError } from '../../../../../core/errors/repository.error';
import { Order } from '../../../domain/entities/order';
import { OrderStatus } from '../../../domain/value-objects/order-status';
import { PaymentMethod } from '../../../domain/value-objects/payment-method';
import { PaymentStatus } from '../../../domain/value-objects/payment-status';
import { UseCaseError } from '../../../../../core/errors/usecase.error';

describe('CancelOrderUseCase', () => {
  let useCase: CancelOrderUseCase;
  let mockRepo: jest.Mocked<OrderRepository>;

  const orderId = 'OR0000001';

  // Mock data for an order that IS in a cancellable state (e.g., 'pending')
  const cancellableOrderPrimitives = {
    id: orderId,
    status: OrderStatus.PENDING,
    customerId: 'CUST1',
    paymentInfoId: 'PAY001',
    shippingAddressId: 'ADDR001',
    items: [
      {
        id: 'item-1',
        productId: 'PR1',
        productName: 'P1',
        quantity: 1,
        unitPrice: 10,
        lineTotal: 10,
      },
    ],
    customerInfo: {
      customerId: 'CUST1',
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
    createdAt: new Date(),
    updatedAt: new Date(),
    customerNotes: 'Please ring doorbell upon delivery',
  };

  const nonCancellableOrderPrimitives = {
    ...cancellableOrderPrimitives,
    status: OrderStatus.SHIPPED,
  };

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      cancelOrder: jest.fn(),
    } as any;
    useCase = new CancelOrderUseCase(mockRepo);
  });

  it('should cancel the order and return its data on success', async () => {
    // Arrange
    const order = Order.fromPrimitives(cancellableOrderPrimitives);
    mockRepo.findById.mockResolvedValue(Result.success(order));
    mockRepo.cancelOrder.mockResolvedValue(Result.success(undefined));

    // Act
    const result = await useCase.execute(orderId);

    // Assert
    expect(mockRepo.findById).toHaveBeenCalledWith(orderId);
    expect(mockRepo.cancelOrder).toHaveBeenCalled();
    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      // The use case should return the primitive form of the order with the new status
      expect(result.value.status).toBe(OrderStatus.CANCELLED);
    }
  });

  it('should return a failure result if the order is not found', async () => {
    // Arrange
    const repoError = new RepositoryError('Order not found');
    mockRepo.findById.mockResolvedValue(Result.failure(repoError));

    // Act
    const result = await useCase.execute(orderId);

    // Assert
    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error).toBe(repoError);
    }
    expect(mockRepo.cancelOrder).not.toHaveBeenCalled();
  });

  it('should return a failure result if the order is not in a cancellable state', async () => {
    // Arrange
    const order = Order.fromPrimitives(nonCancellableOrderPrimitives);
    mockRepo.findById.mockResolvedValue(Result.success(order));

    // Act
    const result = await useCase.execute(orderId);

    // Assert
    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error).toBeInstanceOf(UseCaseError);
      expect(result.error.message).toBe('Order is not in a cancellable state');
    }
    expect(mockRepo.cancelOrder).not.toHaveBeenCalled();
  });

  it('should return a failure result if the repository fails to save the cancellation', async () => {
    // Arrange
    const order = Order.fromPrimitives(cancellableOrderPrimitives);
    const repoError = new RepositoryError('DB write failed');
    mockRepo.findById.mockResolvedValue(Result.success(order));
    mockRepo.cancelOrder.mockResolvedValue(Result.failure(repoError));

    // Act
    const result = await useCase.execute(orderId);

    // Assert
    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error).toBe(repoError);
    }
  });

  it('should return a failure result on an unexpected error', async () => {
    // Arrange
    const unexpectedError = new Error('Database connection lost');
    mockRepo.findById.mockRejectedValue(unexpectedError);

    // Act
    const result = await useCase.execute(orderId);

    // Assert
    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error).toBeInstanceOf(UseCaseError);
      expect(result.error.message).toBe('Unexpected Usecase Error');
      expect(result.error.cause).toBe(unexpectedError);
    }
  });
});
