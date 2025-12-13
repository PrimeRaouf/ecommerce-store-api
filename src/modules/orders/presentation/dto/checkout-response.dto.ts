// src/modules/orders/presentation/dto/checkout-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CheckoutResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  jobId: string;

  @ApiProperty({ example: 'Checkout process started' })
  message: string;
}
