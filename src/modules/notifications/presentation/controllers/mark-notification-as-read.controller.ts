import { Injectable } from '@nestjs/common';
import { MarkNotificationAsReadUseCase } from '../../application/usecases/mark-notification-as-read.usecase';
import { Result } from 'src/core/domain/result';
import { AppError } from 'src/core/errors/app.error';
import { ErrorFactory } from 'src/core/errors/error.factory';

@Injectable()
export class MarkNotificationAsReadController {
  constructor(
    private readonly markAsReadUseCase: MarkNotificationAsReadUseCase,
  ) {}

  async handle(id: string, userId: string): Promise<Result<void, AppError>> {
    try {
      return await this.markAsReadUseCase.execute(id, userId);
    } catch (error) {
      return ErrorFactory.ControllerError(
        'Unexpected error marking notification as read',
        error,
      );
    }
  }
}
