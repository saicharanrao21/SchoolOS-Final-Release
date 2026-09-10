import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { FeeCategoriesService } from './fee-categories.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('finance/fee-categories')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class FeeCategoriesController {
  constructor(private readonly service: FeeCategoriesService) {}

  @Post()
  @Permissions('fees.create')
  create(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.create(organizationId, data, actorId);
  }

  @Get()
  @Permissions('fees.read')
  findAll(@User('org') organizationId: string, @Query('schoolId') schoolId: string) {
    return this.service.findAll(organizationId, schoolId);
  }
}
