// src/modules/orders/presentation/dto/checkout.dto.ts
import {
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethodType } from '../../../payments/domain';
import { ShippingAddressDto } from './shipping-address.dto';

export class CheckoutDto {
  @IsUUID()
  cartId: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress?: ShippingAddressDto;

  @IsEnum(PaymentMethodType)
  paymentMethod: PaymentMethodType;

  @IsOptional()
  @IsString()
  customerNotes?: string;
}
