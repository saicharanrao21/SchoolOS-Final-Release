import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('locations')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @Permissions('location.create')
  create(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.locationsService.create(organizationId, data, actorId);
  }

  @Get()
  @Permissions('location.read')
  findAll(@User('org') organizationId: string, @Query('campusId') campusId?: string) {
    return this.locationsService.findAll(organizationId, campusId);
  }

  @Get(':id')
  @Permissions('location.read')
  findOne(@User('org') organizationId: string, @Param('id') id: string) {
    return this.locationsService.findOne(organizationId, id);
  }

  @Patch(':id')
  @Permissions('location.update')
  update(@User('org') organizationId: string, @Param('id') id: string, @Body() data: any, @User('id') actorId: string) {
    return this.locationsService.update(organizationId, id, data, actorId);
  }

  @Delete(':id')
  @Permissions('location.archive')
  remove(@User('org') organizationId: string, @Param('id') id: string, @User('id') actorId: string) {
    return this.locationsService.remove(organizationId, id, actorId);
  }
}
