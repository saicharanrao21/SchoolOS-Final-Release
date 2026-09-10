import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CampusesService } from './campuses.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('campuses')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class CampusesController {
  constructor(private readonly campusesService: CampusesService) {}

  @Post()
  @Permissions('campus.create')
  create(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.campusesService.create(organizationId, data, actorId);
  }

  @Get()
  @Permissions('campus.read')
  findAll(@User('org') organizationId: string) {
    return this.campusesService.findAll(organizationId);
  }

  @Get(':id')
  @Permissions('campus.read')
  findOne(@User('org') organizationId: string, @Param('id') id: string) {
    return this.campusesService.findOne(organizationId, id);
  }

  @Patch(':id')
  @Permissions('campus.update')
  update(@User('org') organizationId: string, @Param('id') id: string, @Body() data: any, @User('id') actorId: string) {
    return this.campusesService.update(organizationId, id, data, actorId);
  }

  @Delete(':id')
  @Permissions('campus.archive')
  remove(@User('org') organizationId: string, @Param('id') id: string, @User('id') actorId: string) {
    return this.campusesService.remove(organizationId, id, actorId);
  }
}
