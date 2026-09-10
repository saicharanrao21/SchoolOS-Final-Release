import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { HousesService } from './houses.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('houses')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class HousesController {
  constructor(private readonly housesService: HousesService) {}

  @Post()
  @Permissions('house.create')
  create(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.housesService.create(organizationId, data, actorId);
  }

  @Get()
  @Permissions('house.read')
  findAll(@User('org') organizationId: string, @Query('schoolId') schoolId?: string) {
    return this.housesService.findAll(organizationId, schoolId);
  }

  @Get(':id')
  @Permissions('house.read')
  findOne(@User('org') organizationId: string, @Param('id') id: string) {
    return this.housesService.findOne(organizationId, id);
  }

  @Patch(':id')
  @Permissions('house.update')
  update(@User('org') organizationId: string, @Param('id') id: string, @Body() data: any, @User('id') actorId: string) {
    return this.housesService.update(organizationId, id, data, actorId);
  }

  @Delete(':id')
  @Permissions('house.archive')
  remove(@User('org') organizationId: string, @Param('id') id: string, @User('id') actorId: string) {
    return this.housesService.remove(organizationId, id, actorId);
  }
}
