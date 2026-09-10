import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { PolicyGuard } from '../../auth/guards/policy.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { User } from '../../auth/decorators/user.decorator';
import { OrganizationControlPlaneService } from './organization-control-plane.service';

@Controller('management/control-plane')
@UseGuards(AuthGuard('jwt'), PermissionsGuard, PolicyGuard)
export class OrganizationControlPlaneController {
  constructor(private readonly service: OrganizationControlPlaneService) {}

  @Get('organization')
  @Permissions('settings.read')
  async getOrganization(@User('org') organizationId: string) {
    return this.service.getOrganization(organizationId);
  }

  @Put('organization')
  @Permissions('settings.manage')
  async updateOrganization(
    @User('org') organizationId: string,
    @User('id') actorId: string,
    @Body() data: any,
  ) {
    return this.service.updateOrganization(organizationId, actorId, data);
  }

  @Get('schools')
  @Permissions('settings.read')
  async getSchools(@User('org') organizationId: string) {
    return this.service.getSchools(organizationId);
  }

  @Post('schools')
  @Permissions('settings.manage')
  async createSchool(
    @User('org') organizationId: string,
    @User('id') actorId: string,
    @Body() data: any,
  ) {
    return this.service.createSchool(organizationId, actorId, data);
  }

  @Get('schools/:schoolId/campuses')
  @Permissions('settings.read')
  async getCampuses(
    @User('org') organizationId: string,
    @Param('schoolId') schoolId: string,
  ) {
    return this.service.getCampuses(organizationId, schoolId);
  }

  @Post('schools/:schoolId/campuses')
  @Permissions('settings.manage')
  async createCampus(
    @User('org') organizationId: string,
    @Param('schoolId') schoolId: string,
    @User('id') actorId: string,
    @Body() data: any,
  ) {
    return this.service.createCampus(organizationId, schoolId, actorId, data);
  }
}
