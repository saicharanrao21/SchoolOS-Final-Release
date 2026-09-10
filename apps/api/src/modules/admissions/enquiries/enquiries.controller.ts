import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { EnquiriesService } from './enquiries.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('admissions/enquiries')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class EnquiriesController {
  constructor(private readonly enquiriesService: EnquiriesService) {}

  @Post()
  @Permissions('admissions.create')
  create(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) { return this.enquiriesService.create(organizationId, data, actorId); }

  @Get()
  @Permissions('admissions.read')
  findAll(@User('org') organizationId: string, @Query() filters: any) { return this.enquiriesService.findAll(organizationId, filters); }

  @Get('dashboard/summary')
  @Permissions('admissions.read')
  getCrmDashboard(@User('org') organizationId: string, @Query('schoolId') schoolId?: string) { return this.enquiriesService.getCrmDashboard(organizationId, schoolId); }

  @Get('follow-up-queue')
  @Permissions('admissions.read')
  getFollowUpQueue(@User('org') organizationId: string, @Query('schoolId') schoolId?: string) { return this.enquiriesService.getFollowUpQueue(organizationId, schoolId); }

  @Get(':id')
  @Permissions('admissions.read')
  findOne(@User('org') organizationId: string, @Param('id') id: string) { return this.enquiriesService.findOne(organizationId, id); }

  @Post(':id/follow-ups')
  @Permissions('admissions.update')
  addFollowUp(@User('org') organizationId: string, @Param('id') id: string, @Body() data: any, @User('id') actorId: string) { return this.enquiriesService.addFollowUp(organizationId, id, data, actorId); }

  @Post(':id/follow-ups/:followUpId/complete')
  @Permissions('admissions.update')
  completeFollowUp(@User('org') organizationId: string, @Param('id') id: string, @Param('followUpId') followUpId: string, @Body() data: any, @User('id') actorId: string) { return this.enquiriesService.completeFollowUp(organizationId, id, followUpId, data, actorId); }
}
