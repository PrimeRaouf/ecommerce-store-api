// src/modules/payments/infrastructure/gateways/cod.gateway.ts
import { Injectable } from '@nestjs/common';
import { IPaymentGateway } from '../../domain/gateways/payment-gateway.interface';
import { PaymentMethodType } from '../../domain/value-objects/payment-method';
import { PaymentResult } from '../../domain/gateways/payment-result';
import { PaymentStatusType } from '../../domain/value-objects/payment-status';
import { v4 as uuidv4 } from 'uuid';
import { Result } from '../../../../core/domain/result';
import { AppError } from '../../../../core/errors/app.error';

@Injectable()
export class CodGateway implements IPaymentGateway {
  getMethod(): PaymentMethodType {
    return PaymentMethodType.CASH_ON_DELIVERY;
  }

  async authorize(
    amount: number,
    currency: string,
  ): Promise<Result<PaymentResult, AppError>> {
    return Result.success({
      success: true,
      status: PaymentStatusType.AUTHORIZED,
      transactionId: `cod_${uuidv4()}`,
      metadata: {
        method: 'COD',
        amount,
        currency,
      },
    });
  }

  async capture(
    transactionId: string,
  ): Promise<Result<PaymentResult, AppError>> {
    return Result.success({
      success: true,
      status: PaymentStatusType.COMPLETED,
      transactionId,
    });
  }

  async refund(
    transactionId: string,
    amount: number,
  ): Promise<Result<PaymentResult, AppError>> {
    return Result.success({
      success: true,
      status: PaymentStatusType.REFUNDED,
      transactionId,
      metadata: {
        refundAmount: amount,
        note: 'Manual COD refund required',
      },
    });
  }
}
