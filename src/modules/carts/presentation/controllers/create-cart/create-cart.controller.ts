import { Injectable } from '@nestjs/common';
import { CreateCartDto } from '../../dto/create-cart.dto';
import { Result, isFailure } from '../../../../../core/domain/result';
import { ControllerError } from '../../../../../core/errors/controller.error';
import { ErrorFactory } from '../../../../../core/errors/error.factory';
import { CreateCartUseCase } from '../../../application/usecases/create-cart/create-cart.usecase';
import { ICart } from '../../../domain/interfaces/cart.interface';

@Injectable()
export class CreateCartController {
  constructor(private readonly createCartUseCase: CreateCartUseCase) {}
  async handle(dto: CreateCartDto): Promise<Result<ICart, ControllerError>> {
    try {
      const result = await this.createCartUseCase.execute(dto);

      if (isFailure(result)) {
        return ErrorFactory.ControllerError(result.error.message, result.error);
      }

      return Result.success(result.value);
    } catch (error) {
      return ErrorFactory.ControllerError('Unexpected Controller Error', error);
    }
  }
}
