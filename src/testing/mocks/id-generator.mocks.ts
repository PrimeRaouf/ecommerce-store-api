// src/testing/mocks/id-generator.mocks.ts

import { IdGeneratorService } from '../../core/infrastructure/orm/id-generator.service';

export function createMockIdGenerator(baseIds?: {
  orderId?: string;
  customerId?: string;
  paymentId?: string;
  shippingAddressId?: string;
  productId?: string;
  inventoryId?: string;
  cartId?: string;
  refundId?: string;
}): jest.Mocked<IdGeneratorService> {
  const defaults = {
    orderId: 'OR0000001',
    customerId: 'CU0000001',
    paymentId: 'PA0000001',
    shippingAddressId: 'SA0000001',
    productId: 'PR0000001',
    inventoryId: 'IN0000001',
    cartId: 'CA0000001',
    refundId: 'RE0000001',
  };

  const ids = { ...defaults, ...baseIds };

  return {
    generateOrderId: jest.fn().mockResolvedValue(ids.orderId),
    generateCustomerId: jest.fn().mockResolvedValue(ids.customerId),
    generatePaymentId: jest.fn().mockResolvedValue(ids.paymentId),
    generateShippingAddressId: jest
      .fn()
      .mockResolvedValue(ids.shippingAddressId),
    generateInventoryId: jest.fn().mockResolvedValue(ids.inventoryId),
    generateProductId: jest.fn().mockResolvedValue(ids.productId),
    generateCartId: jest.fn().mockResolvedValue(ids.cartId),
    generateRefundId: jest.fn().mockResolvedValue(ids.refundId),
    generatePaymentInfoId: jest.fn().mockResolvedValue(ids.paymentId),
    getCurrentSequenceValue: jest.fn().mockResolvedValue(0),
    resetSequence: jest.fn().mockResolvedValue(undefined),
  } as any;
}
