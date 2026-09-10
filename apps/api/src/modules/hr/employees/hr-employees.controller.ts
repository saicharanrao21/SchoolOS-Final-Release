import { Controller, Get, Post, Body, Param, Patch, UseGuards, Query } from '@nestjs/common';
import { HrEmployeesService } from './hr-employees.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';
import { EmploymentStatus } from '@prisma/client';

@Controller('hr/employees')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class HrEmployeesController {
  constructor(private readonly service: HrEmployeesService) {}

  @Post('onboard')
  @Permissions('hr.employee.create')
  async onboard(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.onboard(organizationId, data, actorId);
  }

  @Get()
  @Permissions('hr.employee.read')
  async findAll(@User('org') organizationId: string, @Query() filters: any) {
    return this.service.findAll(organizationId, filters);
  }

  @Get(':id')
  @Permissions('hr.employee.read')
  async findOne(@User('org') organizationId: string, @Param('id') id: string) {
    return this.service.getProfile(organizationId, id);
  }

  @Patch(':id/status')
  @Permissions('hr.employee.update')
  async updateStatus(
    @User('org') organizationId: string,
    @Param('id') id: string,
    @Body('status') status: EmploymentStatus,
    @User('id') actorId: string
  ) {
    return this.service.updateStatus(organizationId, id, status, actorId);
  }
}
