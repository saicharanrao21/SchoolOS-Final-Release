import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { Prisma } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('schools')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Post()
  @Permissions('school.create')
  create(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.schoolsService.create(organizationId, data, actorId);
  }

  @Get()
  @Permissions('school.read')
  findAll(@User('org') organizationId: string) {
    return this.schoolsService.findAll(organizationId);
  }

  @Get(':id')
  @Permissions('school.read')
  findOne(@User('org') organizationId: string, @Param('id') id: string) {
    return this.schoolsService.findOne(organizationId, id);
  }

  @Patch(':id')
  @Permissions('school.update')
  update(@User('org') organizationId: string, @Param('id') id: string, @Body() data: any, @User('id') actorId: string) {
    return this.schoolsService.update(organizationId, id, data, actorId);
  }

  @Delete(':id')
  @Permissions('school.archive')
  remove(@User('org') organizationId: string, @Param('id') id: string, @User('id') actorId: string) {
    return this.schoolsService.remove(organizationId, id, actorId);
  }
}
