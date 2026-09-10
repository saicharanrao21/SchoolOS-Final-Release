import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { TeacherAssignmentsService } from './teacher-assignments.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('academics/teacher-assignments')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class TeacherAssignmentsController {
  constructor(private readonly service: TeacherAssignmentsService) {}

  @Post()
  @Permissions('academics.manage')
  create(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.create(organizationId, data, actorId);
  }

  @Get()
  @Permissions('academics.read')
  findAll(@User('org') organizationId: string, @Query() filters: any) {
    return this.service.findAll(organizationId, filters);
  }

  @Delete(':id')
  @Permissions('academics.manage')
  remove(@User('org') organizationId: string, @Param('id') id: string, @User('id') actorId: string) {
    return this.service.remove(organizationId, id, actorId);
  }
}
