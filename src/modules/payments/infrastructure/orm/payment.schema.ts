import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RefundEntity } from './refund.schema';
import { PaymentMethodType } from '../../domain/value-objects/payment-method';
import { PaymentStatusType } from '../../domain/value-objects/payment-status';

@Entity({ name: 'payments' })
@Index('idx_payments_order_id', ['orderId'])
@Index('idx_payments_customer_id', ['customerId'])
@Index('idx_payments_transaction_id', ['transactionId'])
export class PaymentEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Column({ name: 'order_id', type: 'varchar' })
  orderId: string;

  @Column({ name: 'customer_id', type: 'varchar', nullable: true })
  customerId: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({ name: 'payment_method', type: 'varchar' })
  paymentMethod: PaymentMethodType;

  @Column({ type: 'varchar' })
  status: PaymentStatusType;

  @Column({ name: 'transaction_id', type: 'varchar', nullable: true })
  transactionId: string | null;

  @Column({ name: 'payment_method_info', type: 'text', nullable: true })
  paymentMethodInfo: string | null;

  @Column({
    name: 'refunded_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  refundedAmount: number;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason: string | null;

  @OneToMany(() => RefundEntity, (refund) => refund.payment, {
    cascade: true,
    eager: true,
  })
  refunds: RefundEntity[];

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
