// src/modules/orders/infrastructure/orm/order.schema.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderItemEntity } from './order-item.schema';
import { IOrder } from '../../domain/interfaces/IOrder';
import { numericToNumber } from '../../../../core/infrastructure/database/number.transformer';
import { OrderStatus } from '../../domain/value-objects/order-status';

@Entity({ name: 'orders' })
export class OrderEntity implements IOrder {
  @PrimaryColumn('varchar')
  id: string;

  @Column({ type: 'varchar' })
  customerId: string;

  @OneToMany(() => OrderItemEntity, (item: OrderItemEntity) => item.order, {
    cascade: true,
  })
  items: OrderItemEntity[];

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: numericToNumber,
  })
  totalPrice: number;

  @Column({ type: 'varchar', default: 'pending' })
  status: OrderStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
