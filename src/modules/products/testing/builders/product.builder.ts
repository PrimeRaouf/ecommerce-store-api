// src/modules/products/testing/builders/product.builder.ts
import { IProduct } from '../../domain/interfaces/product.interface';
import { ProductTestFactory } from '../factories/product.factory';

export class ProductBuilder {
  private product: IProduct;

  constructor() {
    this.product = ProductTestFactory.createMockProduct();
  }

  withId(id: string): this {
    this.product.id = id;
    return this;
  }

  withName(name: string): this {
    this.product.name = name;
    return this;
  }

  withDescription(description?: string): this {
    this.product.description = description;
    return this;
  }

  withPrice(price: number): this {
    this.product.price = price;
    return this;
  }

  withSku(sku?: string): this {
    this.product.sku = sku;
    return this;
  }

  withStockQuantity(quantity: number): this {
    this.product.stockQuantity = quantity;
    return this;
  }

  withCreatedAt(date: Date): this {
    this.product.createdAt = date;
    return this;
  }

  withUpdatedAt(date: Date): this {
    this.product.updatedAt = date;
    return this;
  }

  /**
   * Sets product as in stock with good quantity
   */
  asInStock(): this {
    return this.withStockQuantity(50);
  }

  /**
   * Sets product as low stock (< 5 items)
   */
  asLowStock(): this {
    return this.withStockQuantity(3);
  }

  /**
   * Sets product as out of stock
   */
  asOutOfStock(): this {
    return this.withStockQuantity(0);
  }

  /**
   * Sets product as budget-friendly
   */
  asBudget(): this {
    return this.withPrice(19.99).withName('Budget Product');
  }

  /**
   * Sets product as premium
   */
  asPremium(): this {
    return this.withPrice(999.99)
      .withName('Premium Product')
      .withStockQuantity(5);
  }

  /**
   * Sets product without optional fields
   */
  asMinimal(): this {
    this.product.description = undefined;
    this.product.sku = undefined;
    return this;
  }

  /**
   * Sets product as newly created (recent dates)
   */
  asNew(): this {
    const now = new Date();
    return this.withCreatedAt(now).withUpdatedAt(now);
  }

  /**
   * Sets product as old (dates from past year)
   */
  asOld(): this {
    const lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 1);
    return this.withCreatedAt(lastYear).withUpdatedAt(lastYear);
  }

  build(): IProduct {
    return { ...this.product };
  }
}
