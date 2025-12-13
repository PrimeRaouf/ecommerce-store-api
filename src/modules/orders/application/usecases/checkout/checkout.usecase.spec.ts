import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutUseCase } from './checkout.usecase';
import { OrderScheduler } from '../../../domain/schedulers/order.scheduler';
import { GetCustomerUseCase } from '../../../../customers/application/usecases/get-customer/get-customer.usecase';
import { Result } from '../../../../../core/domain/result';
import { CheckoutDto } from '../../../presentation/dto/checkout.dto';
import { PaymentMethodType } from '../../../../payments/domain';
import { CustomerTestFactory } from '../../../../customers/testing/factories/customer.factory';
import { ResultAssertionHelper } from '../../../../../testing/helpers/result-assertion.helper';
import { Customer } from '../../../../customers/domain/entities/customer';

describe('CheckoutUseCase', () => {
  let useCase: CheckoutUseCase;
  let orderScheduler: jest.Mocked<OrderScheduler>;
  let getCustomerUseCase: jest.Mocked<GetCustomerUseCase>;

  const mockUserId = 'user-123';
  const mockCartId = 'cart-123';
  const mockCustomer = Customer.fromPrimitives(
    CustomerTestFactory.createCustomerWithAddress({ id: mockUserId }),
  );

  beforeEach(async () => {
    const mockOrderScheduler = {
      scheduleCheckout: jest.fn(),
    };

    const mockGetCustomerUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutUseCase,
        { provide: OrderScheduler, useValue: mockOrderScheduler },
        { provide: GetCustomerUseCase, useValue: mockGetCustomerUseCase },
      ],
    }).compile();

    useCase = module.get<CheckoutUseCase>(CheckoutUseCase);
    orderScheduler = module.get(OrderScheduler);
    getCustomerUseCase = module.get(GetCustomerUseCase);
  });

  it('should schedule checkout with default address when no shipping address provided', async () => {
    const dto: CheckoutDto = {
      cartId: mockCartId,
      paymentMethod: PaymentMethodType.CREDIT_CARD,
    };

    getCustomerUseCase.execute.mockResolvedValue(Result.success(mockCustomer));
    orderScheduler.scheduleCheckout.mockResolvedValue(
      Result.success('job-123'),
    );

    const result = await useCase.execute({ dto, userId: mockUserId });

    ResultAssertionHelper.assertResultSuccess(result);
    expect(orderScheduler.scheduleCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        shippingAddress: expect.objectContaining({
          street: mockCustomer.addresses[0].street,
          street2: mockCustomer.addresses[0].street2,
          deliveryInstructions: mockCustomer.addresses[0].deliveryInstructions,
        }),
      }),
    );
  });

  it('should schedule checkout with provided address and map new fields', async () => {
    const dto: CheckoutDto = {
      cartId: mockCartId,
      paymentMethod: PaymentMethodType.CREDIT_CARD,
      shippingAddress: {
        firstName: 'Jane',
        lastName: 'Doe',
        street: '456 New St',
        street2: 'Apt 2',
        city: 'New City',
        state: 'NS',
        postalCode: '99999',
        country: 'US',
        phone: '+9876543210',
        deliveryInstructions: 'Leave at back door',
      },
    };

    getCustomerUseCase.execute.mockResolvedValue(Result.success(mockCustomer));
    orderScheduler.scheduleCheckout.mockResolvedValue(
      Result.success('job-123'),
    );

    const result = await useCase.execute({ dto, userId: mockUserId });

    ResultAssertionHelper.assertResultSuccess(result);
    expect(orderScheduler.scheduleCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        shippingAddress: expect.objectContaining({
          street: '456 New St',
          street2: 'Apt 2',
          deliveryInstructions: 'Leave at back door',
          phone: '+9876543210',
        }),
      }),
    );
  });

  it('should fallback to customer phone if not provided in address', async () => {
    const dto: CheckoutDto = {
      cartId: mockCartId,
      paymentMethod: PaymentMethodType.CREDIT_CARD,
      shippingAddress: {
        firstName: 'Jane',
        lastName: 'Doe',
        street: '456 New St',
        city: 'New City',
        state: 'NS',
        postalCode: '99999',
        country: 'US',
        // No phone provided
      },
    };

    getCustomerUseCase.execute.mockResolvedValue(Result.success(mockCustomer));
    orderScheduler.scheduleCheckout.mockResolvedValue(
      Result.success('job-123'),
    );

    const result = await useCase.execute({ dto, userId: mockUserId });

    ResultAssertionHelper.assertResultSuccess(result);
    expect(orderScheduler.scheduleCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        shippingAddress: expect.objectContaining({
          phone: mockCustomer.phone,
        }),
      }),
    );
  });
});
