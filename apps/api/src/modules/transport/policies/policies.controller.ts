import { Controller, Get, Body, Param, Patch, UseGuards, Query } from '@nestjs/common';
import { TransportPoliciesService } from './policies.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('transport/policies')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class TransportPoliciesController {
  constructor(private readonly service: TransportPoliciesService) {}

  @Get()
  @Permissions('transport.read')
  findOne(@User('org') organizationId: string, @Query('schoolId') schoolId: string) {
    return this.service.findBySchool(organizationId, schoolId);
  }

  @Patch()
  @Permissions('transport.manage')
  update(@User('org') organizationId: string, @Query('schoolId') schoolId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.update(organizationId, schoolId, data, actorId);
  }
}
