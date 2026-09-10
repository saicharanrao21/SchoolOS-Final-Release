import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationChannel } from '@prisma/client';
import { User } from '../../../auth/decorators/user.decorator';
import { Permissions } from '../../../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { NotificationGatewaysService } from './gateways.service';

@Controller('notifications/gateways')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class NotificationGatewaysController {
  constructor(private readonly service: NotificationGatewaysService) {}

  @Get('catalog')
  @Permissions('notifications.gateway.read')
  catalog(@Query('channel') channel?: NotificationChannel) {
    return this.service.catalog(channel);
  }

  @Get()
  @Permissions('notifications.gateway.read')
  list(@User('org') organizationId: string, @Query('schoolId') schoolId: string, @Query('channel') channel?: NotificationChannel) {
    return this.service.list(organizationId, schoolId, channel);
  }

  @Get(':id')
  @Permissions('notifications.gateway.read')
  get(@User('org') organizationId: string, @Query('schoolId') schoolId: string, @Param('id') id: string) {
    return this.service.inspect(organizationId, schoolId, id);
  }

  @Post()
  @Permissions('notifications.gateway.manage')
  create(@User('org') organizationId: string, @User('id') actorId: string, @Body() data: any) {
    return this.service.create(organizationId, data.schoolId, actorId, data);
  }

  @Patch(':id')
  @Permissions('notifications.gateway.manage')
  update(@User('org') organizationId: string, @User('id') actorId: string, @Param('id') id: string, @Body() data: any) {
    return this.service.update(organizationId, data.schoolId, actorId, id, data);
  }

  @Post(':id/default')
  @Permissions('notifications.gateway.manage')
  setDefault(@User('org') organizationId: string, @User('id') actorId: string, @Param('id') id: string, @Body() data: { schoolId: string }) {
    return this.service.setDefault(organizationId, data.schoolId, actorId, id);
  }

  @Delete(':id')
  @Permissions('notifications.gateway.manage')
  remove(@User('org') organizationId: string, @User('id') actorId: string, @Param('id') id: string, @Query('schoolId') schoolId: string) {
    return this.service.remove(organizationId, schoolId, actorId, id);
  }
}
