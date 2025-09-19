// src/modules/orders/domain/factories/order.factory.spec.ts
import { CreateOrderDto } from '../../presentation/dto/create-order.dto';
import { UpdateOrderDto } from '../../presentation/dto/update-order.dto';
import {
  AggregatedOrderInput,
  AggregatedUpdateInput,
  OrderFactory,
} from './order.factory';
import { OrderStatus } from '../value-objects/order-status';
import { DomainError } from '../../../../core/errors/domain.error';

describe('OrderFactory', () => {
  let factory: OrderFactory;

  beforeEach(() => {
    factory = new OrderFactory();
  });

  it('aggregates duplicate items by productId when creating from DTO', () => {
    const dto = {
      customerId: 'cust_1',
      items: [
        { productId: 'P1', quantity: 2 },
        { productId: 'P1', quantity: 3 },
        { productId: 'P2', quantity: 1 },
      ],
    } as CreateOrderDto;

    const aggregated = factory.createFromDto(dto);

    expect(aggregated.items).toHaveLength(2);
    const p1 = aggregated.items.find((i) => i.productId === 'P1')!;
    const p2 = aggregated.items.find((i) => i.productId === 'P2')!;
    expect(p1.quantity).toBe(5);
    expect(p2.quantity).toBe(1);

    expect(dto.items[0].quantity).toBe(2);
    expect(dto.items[1].quantity).toBe(3);
  });

  it('throws when creating from DTO with no items', () => {
    const dto = {
      customerId: 'cust_2',
      items: [],
    } as CreateOrderDto;

    expect(() => factory.createFromDto(dto)).toThrow(
      'Order must have at least one item.',
    );
  });

  it('returns aggregated items and does not compute totalPrice (create)', () => {
    const dto = {
      customerId: 'cust_3',
      items: [
        { productId: 'P3', quantity: 1 },
        { productId: 'P4', quantity: 2 },
      ],
    } as CreateOrderDto;

    const aggregated: AggregatedOrderInput = factory.createFromDto(dto);
    expect(aggregated.items).toHaveLength(2);
  });

  it('updateFromDto returns input unchanged when items are not provided', () => {
    const updateDto = {
      customerId: 'cust_3',
    } as UpdateOrderDto;

    const result = factory.updateFromDto(
      updateDto,
      OrderStatus.PENDING,
    ) as AggregatedUpdateInput;

    expect(result.customerId).toBe('cust_3');
    expect(result.items).toBeUndefined();
  });

  it('aggregates duplicate items by productId when updating from DTO', () => {
    const updateDto = {
      items: [
        { productId: 'PX', quantity: 2 },
        { productId: 'PX', quantity: 4 },
        { productId: 'PY', quantity: 3 },
      ],
    } as any;

    const aggregated = factory.updateFromDto(
      updateDto,
      OrderStatus.PENDING,
    ) as AggregatedUpdateInput;

    expect(aggregated.items).toHaveLength(2);
    const px = aggregated.items?.find((i) => i.productId === 'PX');
    expect(px).toBeDefined();
    expect(px!.quantity).toBe(6);
  });

  it('updateFromDto returns a DomainError when order status is not PENDING', () => {
    const updateDto = {
      customerId: 'cust_3',
    } as UpdateOrderDto;

    const result = factory.updateFromDto(updateDto, OrderStatus.DELIVERED);

    expect(result instanceof DomainError).toBeTruthy();
    expect((result as DomainError).message).toBe(
      'Only orders with status PENDING can be updated.',
    );
  });
});
