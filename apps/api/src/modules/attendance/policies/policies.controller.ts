import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { AttendancePoliciesService } from './policies.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('attendance/policies')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class AttendancePoliciesController {
  constructor(private readonly service: AttendancePoliciesService) {}

  @Post()
  @Permissions('attendance.policy.manage')
  create(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.create(organizationId, data, actorId);
  }

  @Get()
  @Permissions('attendance.read')
  findAll(@User('org') organizationId: string, @Query('schoolId') schoolId: string) {
    return this.service.findAll(organizationId, schoolId);
  }
}
