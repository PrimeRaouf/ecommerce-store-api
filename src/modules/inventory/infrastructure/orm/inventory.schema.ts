import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'inventory' })
@Index(['productId'], { unique: true })
@Index(['availableQuantity'])
export class InventoryEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Column({ name: 'product_id', type: 'varchar' })
  productId: string;

  @Column({ type: 'int' })
  availableQuantity: number;

  @Column({ type: 'int' })
  reservedQuantity: number;

  @Column({ type: 'int' })
  totalQuantity: number;

  @Column({ type: 'int' })
  lowStockThreshold: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastRestockDate: Date | null;
}
