// src/modules/orders/domain/entities/order.entity.ts
import { Money } from '../value-objects/money';
import { OrderStatus, OrderStatusVO } from '../value-objects/order-status';
import { OrderItem, OrderItemProps } from './order-items';

export interface OrderProps {
  id: string;
  customerId: string;
  items: OrderItemProps[];
  status?: string | OrderStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Order {
  private readonly _id: string;
  private readonly _customerId: string;
  private readonly _items: OrderItem[];
  private _status: OrderStatusVO;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: OrderProps) {
    if (!props.id?.trim()) {
      throw new Error('Order ID is required');
    }
    if (!props.customerId?.trim()) {
      throw new Error('Customer ID is required');
    }
    if (!props.items || props.items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    this._id = props.id.trim();
    this._customerId = props.customerId.trim();
    this._items = props.items.map((item) => new OrderItem(item));
    this._status = new OrderStatusVO(props.status || OrderStatus.PENDING);
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  get id(): string {
    return this._id;
  }

  get customerId(): string {
    return this._customerId;
  }

  get items(): readonly OrderItem[] {
    return [...this._items];
  }

  get status(): OrderStatusVO {
    return this._status;
  }

  get totalPrice(): Money {
    return this._items.reduce(
      (total, item) => total.add(item.lineTotal),
      Money.zero(),
    );
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  // Domain methods
  changeStatus(newStatus: OrderStatus | string): void {
    const newStatusVO = new OrderStatusVO(newStatus);

    if (!this._status.canTransitionTo(newStatusVO.value)) {
      throw new Error(
        `Cannot transition from ${this._status.value} to ${newStatusVO.value}`,
      );
    }

    this._status = newStatusVO;
    this._updatedAt = new Date();
  }

  cancel(): void {
    this.changeStatus(OrderStatus.CANCELLED);
  }

  markAsPaid(): void {
    this.changeStatus(OrderStatus.PAID);
  }

  process(): void {
    this.changeStatus(OrderStatus.PROCESSING);
  }

  ship(): void {
    this.changeStatus(OrderStatus.SHIPPED);
  }

  isProcessable(): boolean {
    return this._status.isPaid();
  }

  isShippable(): boolean {
    return this._status.isProcessing();
  }

  isCancellable(): boolean {
    return (
      this._status.isPending() ||
      this._status.isPaid() ||
      this._status.isProcessing()
    );
  }

  toPrimitives() {
    return {
      id: this._id,
      customerId: this._customerId,
      items: this._items.map((item) => item.toPrimitives()),
      status: this._status.value,
      totalPrice: this.totalPrice.value,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  static fromPrimitives(data: any): Order {
    return new Order({
      id: data.id,
      customerId: data.customerId,
      items: data.items || [],
      status: data.status,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  static create(props: {
    id: string;
    customerId: string;
    items: OrderItemProps[];
  }): Order {
    return new Order({
      id: props.id,
      customerId: props.customerId,
      items: props.items,
      status: OrderStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
