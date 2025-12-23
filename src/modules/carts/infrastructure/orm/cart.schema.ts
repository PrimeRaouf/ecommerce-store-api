// src/modules/carts/infrastructure/orm/cart.schema.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CartItemEntity } from './cart-item.schema';

@Entity({ name: 'carts' })
@Index('idx_carts_customer_id', ['customerId'])
@Index('idx_carts_session_id', ['sessionId'])
export class CartEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'customer_id', type: 'varchar', nullable: true })
  customerId: string | null;

  @Column({ name: 'session_id', type: 'varchar', nullable: true })
  sessionId: string | null;

  @OneToMany(() => CartItemEntity, (item) => item.cart, {
    cascade: true,
    eager: true,
  })
  items: CartItemEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
