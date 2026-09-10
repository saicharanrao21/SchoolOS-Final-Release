import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TransportMaintenanceService } from './maintenance.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('transport/maintenance')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class TransportMaintenanceController {
  constructor(private readonly service: TransportMaintenanceService) {}

  @Post()
  @Permissions('transport.maintenance.manage')
  async create(
    @User('org') organizationId: string,
    @User('id') actorId: string,
    @Body() data: any,
  ) {
    return this.service.createMaintenance(organizationId, data, actorId);
  }

  @Patch(':id/status')
  @Permissions('transport.maintenance.manage')
  async updateStatus(
    @User('org') organizationId: string,
    @User('id') actorId: string,
    @Param('id') id: string,
    @Body() body: { status: string; completedDate?: string },
  ) {
    return this.service.updateMaintenanceStatus(organizationId, id, body.status, actorId, body.completedDate);
  }

  @Get()
  @Permissions('transport.vehicles.read')
  async findBySchool(@Query('schoolId') schoolId: string) {
    return this.service.findBySchool(schoolId);
  }

  @Get('compliance')
  @Permissions('transport.vehicles.read')
  async getComplianceSummary(@Query('schoolId') schoolId: string) {
    return this.service.getComplianceSummary(schoolId);
  }
}
