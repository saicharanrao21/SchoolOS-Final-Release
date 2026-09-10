import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { SubstitutionsService } from './substitutions.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('academics/substitutions')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class SubstitutionsController {
  constructor(private readonly service: SubstitutionsService) {}

  @Post()
  @Permissions('substitution.create')
  create(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.create(organizationId, data, actorId);
  }

  @Get()
  @Permissions('substitution.read')
  findAll(@User('org') organizationId: string, @Query() filters: any) {
    return this.service.findAll(organizationId, filters);
  }
}
