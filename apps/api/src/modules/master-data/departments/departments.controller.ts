import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('departments')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @Permissions('department.create')
  create(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.departmentsService.create(organizationId, data, actorId);
  }

  @Get()
  @Permissions('department.read')
  findAll(@User('org') organizationId: string, @Query('schoolId') schoolId?: string) {
    return this.departmentsService.findAll(organizationId, schoolId);
  }

  @Get(':id')
  @Permissions('department.read')
  findOne(@User('org') organizationId: string, @Param('id') id: string) {
    return this.departmentsService.findOne(organizationId, id);
  }

  @Patch(':id')
  @Permissions('department.update')
  update(@User('org') organizationId: string, @Param('id') id: string, @Body() data: any, @User('id') actorId: string) {
    return this.departmentsService.update(organizationId, id, data, actorId);
  }

  @Delete(':id')
  @Permissions('department.archive')
  remove(@User('org') organizationId: string, @Param('id') id: string, @User('id') actorId: string) {
    return this.departmentsService.remove(organizationId, id, actorId);
  }
}
