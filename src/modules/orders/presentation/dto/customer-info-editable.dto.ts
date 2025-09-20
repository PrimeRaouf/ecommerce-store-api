// src/modules/orders/presentation/dto/customer-info-editable.dto.ts
import { OmitType } from '@nestjs/swagger';
import { CustomerInfoDto } from './customer-info.dto';
import { PartialType } from '@nestjs/mapped-types';

export class CustomerInfoEditableDto extends PartialType(
  OmitType(CustomerInfoDto, ['customerId'] as const),
) {}
