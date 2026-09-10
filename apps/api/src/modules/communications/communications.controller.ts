import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommunicationsService } from './communications.service';
import { User } from '../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('communications')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class CommunicationsController {
  constructor(private readonly service: CommunicationsService) {}

  @Get('threads')
  @Permissions('communications.messages.read')
  list(@User('org') org: string, @User('id') userId: string, @Query('schoolId') schoolId: string) {
    return this.service.listThreads(org, schoolId, userId);
  }

  @Post('threads')
  @Permissions('communications.messages.manage')
  create(@User('org') org: string, @User('id') userId: string, @Body() data: any) {
    return this.service.createThread(org, userId, data);
  }

  @Get('threads/:id')
  @Permissions('communications.messages.read')
  get(@User('org') org: string, @User('id') userId: string, @Query('schoolId') schoolId: string, @Param('id') id: string) {
    return this.service.getThread(org, schoolId, userId, id);
  }

  @Post('threads/:id/messages')
  @Permissions('communications.messages.manage')
  send(@User('org') org: string, @User('id') userId: string, @Body() data: any, @Param('id') id: string) {
    return this.service.sendMessage(org, data.schoolId, userId, id, data.body, data.attachments);
  }

  @Post('threads/:id/read')
  @Permissions('communications.messages.read')
  read(@User('org') org: string, @User('id') userId: string, @Body('schoolId') schoolId: string, @Param('id') id: string) {
    return this.service.markRead(org, schoolId, userId, id);
  }

  @Patch('threads/:id/archive')
  @Permissions('communications.messages.manage')
  archive(@User('org') org: string, @User('id') userId: string, @Body('schoolId') schoolId: string, @Param('id') id: string) {
    return this.service.archive(org, schoolId, userId, id);
  }
}
