// src/modules/products/domain/entities/product.entity.ts
import { IProduct } from '../interfaces/product.interface';

export interface ProductProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  sku?: string;
  stockQuantity: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Product implements IProduct {
  private readonly _id: string;
  private _name: string;
  private _description?: string;
  private _price: number;
  private _sku?: string;
  private _stockQuantity: number;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: ProductProps) {
    this.validateProps(props);

    this._id = props.id.trim();
    this._name = props.name.trim();
    this._description = props.description?.trim();
    this._price = this.roundPrice(props.price);
    this._sku = props.sku?.trim().toUpperCase();
    this._stockQuantity = props.stockQuantity;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  private validateProps(props: ProductProps): void {
    if (!props.id?.trim()) {
      throw new Error('Product ID is required');
    }
    if (!props.name?.trim()) {
      throw new Error('Product name is required');
    }
    if (props.price < 0) {
      throw new Error('Product price cannot be negative');
    }
    if (props.stockQuantity < 0) {
      throw new Error('Stock quantity cannot be negative');
    }
    if (!Number.isInteger(props.stockQuantity)) {
      throw new Error('Stock quantity must be an integer');
    }
  }

  private roundPrice(price: number): number {
    return Math.round(price * 100) / 100;
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | undefined {
    return this._description;
  }

  get price(): number {
    return this._price;
  }

  get sku(): string | undefined {
    return this._sku;
  }

  get stockQuantity(): number {
    return this._stockQuantity;
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  // Business logic methods
  isInStock(): boolean {
    return this._stockQuantity > 0;
  }

  hasLowStock(threshold: number = 5): boolean {
    return this._stockQuantity <= threshold && this._stockQuantity > 0;
  }

  isOutOfStock(): boolean {
    return this._stockQuantity === 0;
  }

  canFulfillQuantity(quantity: number): boolean {
    return this._stockQuantity >= quantity;
  }

  // Update methods
  updateName(name: string): void {
    if (!name?.trim()) {
      throw new Error('Product name cannot be empty');
    }
    this._name = name.trim();
    this._updatedAt = new Date();
  }

  updateDescription(description?: string): void {
    this._description = description?.trim();
    this._updatedAt = new Date();
  }

  updatePrice(price: number): void {
    if (price < 0) {
      throw new Error('Product price cannot be negative');
    }
    this._price = this.roundPrice(price);
    this._updatedAt = new Date();
  }

  updateSku(sku?: string): void {
    this._sku = sku?.trim().toUpperCase();
    this._updatedAt = new Date();
  }

  increaseStock(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('Quantity to increase must be positive');
    }
    if (!Number.isInteger(quantity)) {
      throw new Error('Quantity must be an integer');
    }
    this._stockQuantity += quantity;
    this._updatedAt = new Date();
  }

  decreaseStock(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('Quantity to decrease must be positive');
    }
    if (!Number.isInteger(quantity)) {
      throw new Error('Quantity must be an integer');
    }
    if (this._stockQuantity < quantity) {
      throw new Error('Insufficient stock');
    }
    this._stockQuantity -= quantity;
    this._updatedAt = new Date();
  }

  setStockQuantity(quantity: number): void {
    if (quantity < 0) {
      throw new Error('Stock quantity cannot be negative');
    }
    if (!Number.isInteger(quantity)) {
      throw new Error('Stock quantity must be an integer');
    }
    this._stockQuantity = quantity;
    this._updatedAt = new Date();
  }

  updateProduct(updates: {
    name?: string;
    description?: string;
    price?: number;
    sku?: string;
  }): void {
    if (updates.name !== undefined) {
      this.updateName(updates.name);
    }
    if (updates.description !== undefined) {
      this.updateDescription(updates.description);
    }
    if (updates.price !== undefined) {
      this.updatePrice(updates.price);
    }
    if (updates.sku !== undefined) {
      this.updateSku(updates.sku);
    }
  }

  // Serialization
  toPrimitives(): IProduct {
    return {
      id: this._id,
      name: this._name,
      description: this._description,
      price: this._price,
      sku: this._sku,
      stockQuantity: this._stockQuantity,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  static fromPrimitives(data: ProductProps): Product {
    return new Product(data);
  }

  static create(
    props: Omit<ProductProps, 'id' | 'createdAt' | 'updatedAt'> & {
      id: string;
    },
  ): Product {
    return new Product({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
