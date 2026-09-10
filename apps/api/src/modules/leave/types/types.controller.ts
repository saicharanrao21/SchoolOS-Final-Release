import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { LeaveTypesService } from './types.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('leave/types')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class LeaveTypesController {
  constructor(private readonly service: LeaveTypesService) {}

  @Post()
  @Permissions('leave.policy.manage')
  create(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.create(organizationId, data, actorId);
  }

  @Get()
  @Permissions('leave.read')
  findAll(@User('org') organizationId: string, @Query('schoolId') schoolId: string) {
    return this.service.findAll(organizationId, schoolId);
  }
}
