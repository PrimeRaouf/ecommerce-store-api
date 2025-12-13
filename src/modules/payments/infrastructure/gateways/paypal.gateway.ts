// src/modules/payments/infrastructure/gateways/paypal.gateway.ts
import { Injectable } from '@nestjs/common';
import { IPaymentGateway } from '../../domain/gateways/payment-gateway.interface';
import { PaymentMethodType } from '../../domain/value-objects/payment-method';
import { PaymentResult } from '../../domain/gateways/payment-result';
import { PaymentStatusType } from '../../domain/value-objects/payment-status';
import { v4 as uuidv4 } from 'uuid';
import { Result } from '../../../../core/domain/result';
import { AppError } from '../../../../core/errors/app.error';

@Injectable()
export class PayPalGateway implements IPaymentGateway {
  getMethod(): PaymentMethodType {
    return PaymentMethodType.PAYPAL;
  }

  async authorize(
    amount: number,
    currency: string,
    paymentMethodDetails?: string,
  ): Promise<Result<PaymentResult, AppError>> {
    // STUB: Simulate PayPal authorization
    return Result.success({
      success: true,
      status: PaymentStatusType.AUTHORIZED,
      transactionId: `paypal_order_${uuidv4()}`,
      metadata: {
        method: 'PayPal',
        amount,
        currency,
        details: paymentMethodDetails,
      },
    });
  }

  async capture(
    transactionId: string,
  ): Promise<Result<PaymentResult, AppError>> {
    // STUB: Simulate PayPal capture
    return Result.success({
      success: true,
      status: PaymentStatusType.CAPTURED,
      transactionId,
    });
  }

  async refund(
    transactionId: string,
    amount: number,
  ): Promise<Result<PaymentResult, AppError>> {
    // STUB: Simulate PayPal refund
    return Result.success({
      success: true,
      status: PaymentStatusType.REFUNDED,
      transactionId,
      metadata: {
        refundAmount: amount,
      },
    });
  }
}
