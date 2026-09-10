import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { AttendanceSessionsService } from './sessions.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';
import { AttendanceSessionStatus } from '@prisma/client';

import { WorkingDaysService } from '../working-days.service';

@Controller('attendance/sessions')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class AttendanceSessionsController {
  constructor(
    private readonly service: AttendanceSessionsService,
    private readonly workingDays: WorkingDaysService,
  ) {}

  @Get('is-working-day')
  @Permissions('attendance.read')
  isWorkingDay(@User('org') organizationId: string, @Query('schoolId') schoolId: string, @Query('date') date: string) {
    return this.workingDays.isWorkingDay(schoolId, new Date(date));
  }

  @Post()
  @Permissions('attendance.mark')
  create(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.create(organizationId, data, actorId);
  }

  @Get(':id')
  @Permissions('attendance.read')
  findOne(@User('org') organizationId: string, @Param('id') id: string) {
    return this.service.findOne(organizationId, id);
  }

  @Patch(':id/status')
  @Permissions('attendance.lock')
  updateStatus(
    @User('org') organizationId: string,
    @Param('id') id: string,
    @Body('status') status: AttendanceSessionStatus,
    @User('id') actorId: string
  ) {
    return this.service.updateStatus(organizationId, id, status, actorId);
  }
}
