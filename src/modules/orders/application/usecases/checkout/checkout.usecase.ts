// src/modules/orders/application/usecases/checkout/checkout.usecase.ts
import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../core/application/use-cases/base.usecase';
import { Result, isFailure } from '../../../../../core/domain/result';
import { UseCaseError } from '../../../../../core/errors/usecase.error';
import { ErrorFactory } from '../../../../../core/errors/error.factory';
import { CheckoutDto } from '../../../presentation/dto/checkout.dto';
import { ShippingAddressDto } from '../../../presentation/dto/shipping-address.dto';
import { GetCustomerUseCase } from '../../../../customers/application/usecases/get-customer/get-customer.usecase';
import { ICustomer } from '../../../../customers/domain/interfaces/customer.interface';
import { CheckoutResponseDto } from '../../../presentation/dto/checkout-response.dto';
import { v4 as uuidv4 } from 'uuid';
import { OrderScheduler } from '../../../domain/schedulers/order.scheduler';
import { ShippingAddressProps } from '../../../domain/value-objects/shipping-address';

@Injectable()
export class CheckoutUseCase extends UseCase<
  { dto: CheckoutDto; userId: string },
  CheckoutResponseDto,
  UseCaseError
> {
  constructor(
    private readonly orderScheduler: OrderScheduler,
    private readonly getCustomerUseCase: GetCustomerUseCase,
  ) {
    super();
  }

  async execute(input: {
    dto: CheckoutDto;
    userId: string;
  }): Promise<Result<CheckoutResponseDto, UseCaseError>> {
    const { dto, userId } = input;

    try {
      const customerResult = await this.getCustomerUseCase.execute(userId);
      if (isFailure(customerResult)) {
        return ErrorFactory.UseCaseError(
          'Failed to fetch customer for address resolution',
          customerResult.error,
        );
      }
      const customer = customerResult.value;

      const shippingAddress = dto.shippingAddress
        ? this.buildAddressFromDto(dto.shippingAddress, customer)
        : this.buildAddressFromDefault(customer);

      if (!shippingAddress) {
        return ErrorFactory.UseCaseError(
          'No default address found. Please provide a shipping address.',
        );
      }

      const jobResult = await this.orderScheduler.scheduleCheckout({
        cartId: dto.cartId,
        userId,
        shippingAddress,
        paymentMethod: dto.paymentMethod,
        customerNotes: dto.customerNotes,
      });

      if (isFailure(jobResult)) {
        return ErrorFactory.UseCaseError(
          'Failed to schedule checkout',
          jobResult.error,
        );
      }

      return Result.success({
        jobId: jobResult.value,
        message: 'Checkout process started',
      });
    } catch (error) {
      return ErrorFactory.UseCaseError('Unexpected checkout error', error);
    }
  }

  private buildAddressFromDto(
    dto: ShippingAddressDto,
    customer: ICustomer,
  ): ShippingAddressProps {
    return {
      id: uuidv4(),
      firstName: dto.firstName ?? customer.firstName,
      lastName: dto.lastName ?? customer.lastName,
      street: dto.street,
      street2: dto.street2 ?? null,
      city: dto.city,
      state: dto.state,
      postalCode: dto.postalCode,
      country: dto.country,
      phone: dto.phone ?? customer.phone,
      deliveryInstructions: dto.deliveryInstructions ?? null,
    };
  }

  private buildAddressFromDefault(
    customer: ICustomer,
  ): ShippingAddressProps | null {
    const defaultAddress = customer.addresses.find((addr) => addr.isDefault);
    if (!defaultAddress) return null;

    return {
      id: defaultAddress.id!,
      firstName: customer.firstName,
      lastName: customer.lastName,
      street: defaultAddress.street,
      street2: defaultAddress.street2,
      city: defaultAddress.city,
      state: defaultAddress.state,
      postalCode: defaultAddress.postalCode,
      country: defaultAddress.country,
      phone: customer.phone,
      deliveryInstructions: defaultAddress.deliveryInstructions,
    };
  }
}
