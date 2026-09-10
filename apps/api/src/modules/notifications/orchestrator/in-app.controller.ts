import { Controller, Get, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { NotificationStatus } from '@prisma/client';

@Controller('notifications/in-app')
@UseGuards(AuthGuard('jwt'))
export class InAppNotificationsController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  async getMyNotifications(@User('id') userId: string, @Query('unreadOnly') unreadOnly?: string) {
    return this.db.notification.findMany({
      where: {
        recipientId: userId,
        channel: 'IN_APP',
        status: unreadOnly === 'true' ? NotificationStatus.SENT : undefined
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
  }

  @Patch(':id/read')
  async markAsRead(@User('id') userId: string, @Param('id') id: string) {
    return this.db.notification.update({
      where: { id, recipientId: userId },
      data: { status: NotificationStatus.DELIVERED, deliveredAt: new Date() }
    });
  }

  @Patch('read-all')
  async markAllRead(@User('id') userId: string) {
    return this.db.notification.updateMany({
      where: { recipientId: userId, channel: 'IN_APP', status: NotificationStatus.SENT },
      data: { status: NotificationStatus.DELIVERED, deliveredAt: new Date() }
    });
  }
}
