import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { CurriculumService } from './curriculum.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('academics/curriculum')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class CurriculumController {
  constructor(private readonly service: CurriculumService) {}

  @Post()
  @Permissions('curriculum.manage')
  create(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.create(organizationId, data, actorId);
  }

  @Get()
  @Permissions('curriculum.read')
  findAll(@User('org') organizationId: string, @Query() filters: any) {
    return this.service.findAll(organizationId, filters);
  }

  @Get(':id')
  @Permissions('curriculum.read')
  findOne(@User('org') organizationId: string, @Param('id') id: string) {
    return this.service.findOne(organizationId, id);
  }
}
