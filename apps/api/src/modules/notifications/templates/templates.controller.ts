import { Controller, Get, Post, Body, Param, Patch, UseGuards, Query } from '@nestjs/common';
import { NotificationTemplatesService } from './templates.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('notifications/templates')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class NotificationTemplatesController {
  constructor(private readonly service: NotificationTemplatesService) {}

  @Post()
  @Permissions('notifications.template.manage')
  create(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.create(organizationId, data, actorId);
  }

  @Get()
  @Permissions('notifications.template.read')
  findAll(@User('org') organizationId: string, @Query('schoolId') schoolId: string) {
    return this.service.findAll(organizationId, schoolId);
  }

  @Patch(':id')
  @Permissions('notifications.template.manage')
  update(@User('org') organizationId: string, @Param('id') id: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.update(organizationId, id, data, actorId);
  }
}
