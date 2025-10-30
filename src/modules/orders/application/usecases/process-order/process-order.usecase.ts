import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../../core/application/use-cases/base.usecase';
import { Result } from '../../../../../core/domain/result';
import { ErrorFactory } from '../../../../../core/errors/error.factory';
import { UseCaseError } from '../../../../../core/errors/usecase.error';
import { Order } from '../../../domain/entities/order';
import { IOrder } from '../../../domain/interfaces/order.interface';
import { OrderRepository } from '../../../domain/repositories/order-repository';

@Injectable()
export class ProcessOrderUseCase
  implements UseCase<string, IOrder, UseCaseError>
{
  constructor(private orderRepository: OrderRepository) {}
  async execute(id: string): Promise<Result<IOrder, UseCaseError>> {
    try {
      const orderResult = await this.orderRepository.findById(id);
      if (orderResult.isFailure) return orderResult;

      const order: Order = orderResult.value;
      if (!order.canBeProcessed()) {
        return ErrorFactory.UseCaseError('Order is not in a shippable state');
      }

      order.process();

      const updateResult = await this.orderRepository.updateStatus(
        order.id,
        order.status,
      );
      if (updateResult.isFailure) return updateResult;

      return Result.success(order.toPrimitives());
    } catch (error) {
      return ErrorFactory.UseCaseError('Unexpected Usecase Error', error);
    }
  }
}
