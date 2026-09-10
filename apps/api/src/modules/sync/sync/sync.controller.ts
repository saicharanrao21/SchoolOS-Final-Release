import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { SyncService } from './sync.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';

@Controller('sync')
@UseGuards(AuthGuard('jwt'))
export class SyncController {
  constructor(private readonly service: SyncService) {}

  @Get('pull')
  async getIncrementalSync(
    @User('id') userId: string,
    @User('org') organizationId: string,
    @Query('since') sinceTimestamp?: string,
  ) {
    return this.service.getIncrementalSync(userId, organizationId, sinceTimestamp);
  }

  @Post('push')
  async processMutation(
    @User('id') userId: string,
    @User('org') organizationId: string,
    @Body() data: any,
  ) {
    return this.service.processClientMutation(organizationId, userId, data);
  }
}
