import { Controller, Post, Body, UseGuards, Delete, Param } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';

@Controller('notifications/devices')
@UseGuards(AuthGuard('jwt'))
export class NotificationDevicesController {
  constructor(private readonly db: DatabaseService) {}

  @Post('register')
  async register(@User('id') userId: string, @Body() data: any) {
    return this.db.notificationDevice.upsert({
      where: { userId_deviceId: { userId, deviceId: data.deviceId } },
      update: {
        pushToken: data.pushToken,
        platform: data.platform,
        appVersion: data.appVersion,
        isActive: true,
        lastSeen: new Date(),
      },
      create: {
        userId,
        deviceId: data.deviceId,
        pushToken: data.pushToken,
        platform: data.platform,
        appVersion: data.appVersion,
      },
    });
  }

  @Delete(':deviceId')
  async unregister(@User('id') userId: string, @Param('deviceId') deviceId: string) {
    return this.db.notificationDevice.update({
      where: { userId_deviceId: { userId, deviceId } },
      data: { isActive: false },
    });
  }
}
