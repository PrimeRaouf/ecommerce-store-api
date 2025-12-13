import { Result } from '../../../../core/domain/result';
import { InfrastructureError } from '../../../../core/errors/infrastructure-error';
import { PaymentMethodType } from '../../../payments/domain';
import { ShippingAddressProps } from '../value-objects/shipping-address';

export interface ScheduleCheckoutProps {
  cartId: string;
  userId: string;
  shippingAddress: ShippingAddressProps;
  paymentMethod: PaymentMethodType;
  customerNotes?: string;
}

export abstract class OrderScheduler {
  abstract scheduleCheckout(
    props: ScheduleCheckoutProps,
  ): Promise<Result<string, InfrastructureError>>;
}
