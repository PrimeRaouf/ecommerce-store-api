// cancel-order.controller.spec.ts
import { CancelOrderController } from './cancel-order.controller';
import { CancelOrderUseCase } from '../../../application/usecases/cancel-order/cancel-order.usecase';
import { Result } from '../../../../../core/domain/result';
import { IOrder } from '../../../domain/interfaces/order.interface';
import { UseCaseError } from '../../../../../core/errors/usecase.error';
import { OrderStatus } from '../../../domain/value-objects/order-status';
import { PaymentStatus } from '../../../domain/value-objects/payment-status';
import { PaymentMethod } from '../../../domain/value-objects/payment-method';

describe('CancelOrderController', () => {
  let controller: CancelOrderController;
  let mockUseCase: jest.Mocked<CancelOrderUseCase>;

  const mockOrder: IOrder = {
    // Basic identifiers
    id: 'OR0001',
    customerId: 'CUST1',
    paymentInfoId: 'PAY001',
    shippingAddressId: 'ADDR001',

    // Order items
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

    // Customer information
    customerInfo: {
      customerId: 'CUST1',
      email: 'customer@example.com',
      phone: '+1234567890',
      firstName: 'John',
      lastName: 'Doe',
    },

    // Payment information
    paymentInfo: {
      id: 'PAY001',
      method: PaymentMethod.CREDIT_CARD,
      amount: 15,
      status: PaymentStatus.PENDING,
      transactionId: 'TXN123456',
      notes: 'Awaiting payment confirmation',
    },

    // Shipping address
    shippingAddress: {
      id: 'ADDR001',
      firstName: 'John',
      lastName: 'Doe',
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
      phone: '+1234567890',
    },

    // Pricing
    subtotal: 10,
    shippingCost: 5,
    totalPrice: 15,

    // Order status and timestamps
    status: OrderStatus.PENDING,
    createdAt: new Date('2025-01-01T10:00:00Z'),
    updatedAt: new Date('2025-01-01T10:00:00Z'),

    // Optional customer notes
    customerNotes: 'Please ring doorbell upon delivery',
  };

  beforeEach(() => {
    mockUseCase = {
      execute: jest.fn(),
    } as any;

    controller = new CancelOrderController(mockUseCase);
  });

  it('should return success result when use case succeeds', async () => {
    mockUseCase.execute.mockResolvedValue(Result.success(mockOrder));

    const result = await controller.handle('123');

    expect(mockUseCase.execute).toHaveBeenCalledWith('123');
    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) expect(result.value).toEqual(mockOrder);
  });

  it('should return failure result when use case fails', async () => {
    const useCaseError = new UseCaseError('Order cannot be cancelled');
    mockUseCase.execute.mockResolvedValue(Result.failure(useCaseError));

    const result = await controller.handle('123');

    expect(result.isFailure).toBe(true);
    if (result.isFailure) expect(result.error).toBe(useCaseError);
  });

  it('should catch unexpected errors and wrap in ControllerError', async () => {
    mockUseCase.execute.mockRejectedValue(new Error('Unexpected'));

    const result = await controller.handle('123');

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error.name).toBe('ControllerError');
      expect(result.error.message).toContain('Unexpected Controller Error');
    }
  });
});
