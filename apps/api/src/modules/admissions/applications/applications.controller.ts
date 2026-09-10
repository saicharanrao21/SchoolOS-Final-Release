import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';
import { AdmissionStatus } from '@prisma/client';

@Controller('admissions/applications')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @Permissions('admissions.create')
  create(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.applicationsService.create(organizationId, data, actorId);
  }

  @Get()
  @Permissions('admissions.read')
  findAll(@User('org') organizationId: string, @Query() filters: any) {
    return this.applicationsService.findAll(organizationId, filters);
  }

  @Get(':id')
  @Permissions('admissions.read')
  findOne(@User('org') organizationId: string, @Param('id') id: string) {
    return this.applicationsService.findOne(organizationId, id);
  }

  @Patch(':id/status')
  @Permissions('admissions.decision.manage')
  updateStatus(
    @User('org') organizationId: string,
    @Param('id') id: string,
    @Body('status') status: AdmissionStatus,
    @Body('reason') reason: string,
    @User('id') actorId: string
  ) {
    return this.applicationsService.updateStatus(organizationId, id, status, actorId, reason);
  }

  @Post(':id/convert')
  @Permissions('admissions.convert')
  convertToStudent(
    @User('org') organizationId: string,
    @Param('id') id: string,
    @Body('sectionId') sectionId: string,
    @User('id') actorId: string
  ) {
    return this.applicationsService.convertToStudent(organizationId, id, sectionId, actorId);
  }
}
