import { Controller, Get, Post, Body, UseGuards, Query, Param } from '@nestjs/common';
import { FeeStructuresService } from './fee-structures.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('finance/fee-structures')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class FeeStructuresController {
  constructor(private readonly service: FeeStructuresService) {}

  @Post()
  @Permissions('fees.create')
  create(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.create(organizationId, data, actorId);
  }

  @Get()
  @Permissions('fees.read')
  findAll(@User('org') organizationId: string, @Query() filters: any) {
    return this.service.findAll(organizationId, filters);
  }

  @Get(':id')
  @Permissions('fees.read')
  findOne(@User('org') organizationId: string, @Param('id') id: string) {
    return this.service.findOne(organizationId, id);
  }
}
