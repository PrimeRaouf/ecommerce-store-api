// src/modules/orders/application/dtos/order-response.dto.ts
import { OrderItemResponseDto } from './order-item-response.dto';

export class OrderResponseDto {
  id: string;
  customerId: string;
  items: OrderItemResponseDto[];
  status: 'pending' | 'paid' | 'shipped' | 'cancelled';
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}
