import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('communications/campaigns')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class CampaignsController {
  constructor(private readonly service: CampaignsService) {}

  @Post()
  @Permissions('notifications.manage')
  async create(
    @User('org') organizationId: string,
    @User('id') actorId: string,
    @Body() data: any,
  ) {
    return this.service.createCampaign(organizationId, data, actorId);
  }

  @Post(':id/execute')
  @Permissions('notifications.manage')
  async execute(
    @User('org') organizationId: string,
    @User('id') actorId: string,
    @Param('id') campaignId: string,
  ) {
    return this.service.executeCampaign(organizationId, campaignId, actorId);
  }

  @Get()
  @Permissions('notifications.read')
  async getCampaigns(@User('org') organizationId: string, @Query('schoolId') schoolId: string) {
    return this.service.getCampaigns(organizationId, schoolId);
  }

  @Get('stats')
  @Permissions('notifications.read')
  async getStats(@User('org') organizationId: string, @Query('schoolId') schoolId: string) {
    return this.service.getCampaignStats(organizationId, schoolId);
  }
}
