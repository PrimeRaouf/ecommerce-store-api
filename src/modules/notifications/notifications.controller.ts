import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JWTAuthGuard } from 'src/modules/auth/guards/auth.guard';
import { GetUserNotificationsController } from './presentation/controllers/get-user-notifications.controller';
import { MarkNotificationAsReadController } from './presentation/controllers/mark-notification-as-read.controller';
import { NotificationStatus } from './domain/enums/notification-status.enum';
import { isFailure } from 'src/core/domain/result';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly getUserNotificationsController: GetUserNotificationsController,
    private readonly markNotificationAsReadController: MarkNotificationAsReadController,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  async getUserNotifications(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: NotificationStatus,
  ) {
    const result = await this.getUserNotificationsController.handle(
      req.user.userId,
      Number(page),
      Number(limit),
      status,
    );
    if (isFailure(result)) throw result.error;
    return {
      ...result.value,
      data: result.value.data.map((n) => n.toPrimitives()),
    };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Request() req, @Param('id') id: string) {
    const result = await this.markNotificationAsReadController.handle(
      id,
      req.user.userId,
    );
    if (isFailure(result)) throw result.error;
    return result.value;
  }
}
