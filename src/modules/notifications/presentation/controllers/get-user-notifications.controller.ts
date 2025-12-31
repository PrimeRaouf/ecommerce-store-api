import { Injectable } from '@nestjs/common';
import {
  GetUserNotificationsUseCase,
  GetUserNotificationsResponse,
} from '../../application/usecases/get-user-notifications.usecase';
import { NotificationStatus } from '../../domain/enums/notification-status.enum';
import { Result } from 'src/core/domain/result';
import { AppError } from 'src/core/errors/app.error';
import { ErrorFactory } from 'src/core/errors/error.factory';

@Injectable()
export class GetUserNotificationsController {
  constructor(
    private readonly getUserNotificationsUseCase: GetUserNotificationsUseCase,
  ) {}

  async handle(
    userId: string,
    page: number,
    limit: number,
    status?: NotificationStatus,
  ): Promise<Result<GetUserNotificationsResponse, AppError>> {
    try {
      return await this.getUserNotificationsUseCase.execute({
        userId,
        page,
        limit,
        status,
      });
    } catch (error) {
      return ErrorFactory.ControllerError(
        'Unexpected error fetching notifications',
        error,
      );
    }
  }
}
