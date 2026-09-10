import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { LeaveRequestsService } from './requests.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';
import { LeaveStatus } from '@prisma/client';

@Controller('leave/requests')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class LeaveRequestsController {
  constructor(private readonly service: LeaveRequestsService) {}

  @Post()
  @Permissions('leave.request')
  submit(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.submit(organizationId, data, actorId);
  }

  @Patch(':id/approve')
  @Permissions('leave.approve')
  approve(
    @User('org') organizationId: string,
    @Param('id') id: string,
    @Body('status') status: LeaveStatus,
    @Body('remarks') remarks: string,
    @User('id') actorId: string
  ) {
    return this.service.approve(organizationId, id, status, actorId, remarks);
  }
}
