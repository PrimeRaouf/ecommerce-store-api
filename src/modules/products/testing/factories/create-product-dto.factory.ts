// src/modules/products/testing/factories/create-product-dto.factory.ts

import { CreateProductDto } from '../../presentation/dto/create-product.dto';

export class CreateProductDtoFactory {
  /**
   * Creates a valid CreateProductDto for testing
   */
  static createMockDto(
    overrides?: Partial<CreateProductDto>,
  ): CreateProductDto {
    const baseDto: CreateProductDto = {
      name: 'Test Product',
      description: 'A test product description',
      price: 100,
      sku: 'TEST-001',
      stockQuantity: 10,
    };

    return { ...baseDto, ...overrides };
  }

  /**
   * Creates DTO for expensive product
   */
  static createExpensiveProductDto(
    overrides?: Partial<CreateProductDto>,
  ): CreateProductDto {
    return this.createMockDto({
      name: 'Luxury Car',
      description: 'A fast red sports car',
      price: 35000,
      sku: 'CAR-001',
      stockQuantity: 2,
      ...overrides,
    });
  }

  /**
   * Creates DTO for budget product
   */
  static createBudgetProductDto(
    overrides?: Partial<CreateProductDto>,
  ): CreateProductDto {
    return this.createMockDto({
      name: 'Budget Item',
      price: 9.99,
      stockQuantity: 100,
      ...overrides,
    });
  }

  /**
   * Creates minimal DTO (without optional fields)
   */
  static createMinimalDto(): CreateProductDto {
    return {
      name: 'Minimal Product',
      price: 50,
      stockQuantity: 10,
    };
  }

  /**
   * Creates DTO with high stock
   */
  static createHighStockDto(
    overrides?: Partial<CreateProductDto>,
  ): CreateProductDto {
    return this.createMockDto({
      stockQuantity: 1000,
      ...overrides,
    });
  }

  /**
   * Creates DTO with low stock
   */
  static createLowStockDto(
    overrides?: Partial<CreateProductDto>,
  ): CreateProductDto {
    return this.createMockDto({
      stockQuantity: 2,
      ...overrides,
    });
  }

  /**
   * Creates invalid DTO for negative testing
   */
  static createInvalidDto(): CreateProductDto {
    return {
      name: '', // Invalid - empty name
      price: -10, // Invalid - negative price
      stockQuantity: -5, // Invalid - negative stock
      sku: '',
    };
  }

  /**
   * Creates DTO with zero price
   */
  static createFreeProductDto(
    overrides?: Partial<CreateProductDto>,
  ): CreateProductDto {
    return this.createMockDto({
      name: 'Free Sample',
      price: 0,
      ...overrides,
    });
  }
}
