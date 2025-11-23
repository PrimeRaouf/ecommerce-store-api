import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PaymentEntity } from './payment.schema';

@Entity({ name: 'refunds' })
@Index('idx_refunds_payment_id', ['paymentId'])
export class RefundEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Column({ name: 'payment_id', type: 'varchar' })
  paymentId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'varchar' })
  status: string;

  @ManyToOne(() => PaymentEntity, (payment) => payment.refunds)
  @JoinColumn({ name: 'payment_id' })
  payment: PaymentEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
