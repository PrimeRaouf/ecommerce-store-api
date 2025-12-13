// src/modules/payments/infrastructure/gateways/stripe.gateway.ts
import { Injectable } from '@nestjs/common';
import { IPaymentGateway } from '../../domain/gateways/payment-gateway.interface';
import { PaymentMethodType } from '../../domain/value-objects/payment-method';
import { PaymentResult } from '../../domain/gateways/payment-result';
import { PaymentStatusType } from '../../domain/value-objects/payment-status';
import { v4 as uuidv4 } from 'uuid';
import { Result } from '../../../../core/domain/result';
import { AppError } from '../../../../core/errors/app.error';

@Injectable()
export class StripeGateway implements IPaymentGateway {
  getMethod(): PaymentMethodType {
    return PaymentMethodType.STRIPE;
  }

  async authorize(
    amount: number,
    currency: string,
    paymentMethodDetails?: string,
  ): Promise<Result<PaymentResult, AppError>> {
    // STUB: Simulate Stripe authorization
    return Result.success({
      success: true,
      status: PaymentStatusType.AUTHORIZED,
      transactionId: `stripe_pi_${uuidv4()}`,
      metadata: {
        method: 'Stripe',
        amount,
        currency,
        details: paymentMethodDetails,
      },
    });
  }

  async capture(
    transactionId: string,
  ): Promise<Result<PaymentResult, AppError>> {
    // STUB: Simulate Stripe capture
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
    // STUB: Simulate Stripe refund
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
