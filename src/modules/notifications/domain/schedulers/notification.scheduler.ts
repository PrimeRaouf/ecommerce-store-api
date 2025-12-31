import { Result } from 'src/core/domain/result';
import { InfrastructureError } from 'src/core/errors/infrastructure-error';
import { Notification } from '../entities/notification';

export abstract class NotificationScheduler {
  abstract scheduleNotification(
    notification: Notification,
  ): Promise<Result<{ jobId: string }, InfrastructureError>>;
}
