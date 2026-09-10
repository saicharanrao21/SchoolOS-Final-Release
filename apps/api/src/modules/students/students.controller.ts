import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { StudentsService } from './students.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { StudentStatus } from '@prisma/client';

@Controller('students')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Permissions('student.create')
  create(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.studentsService.create(organizationId, data, actorId);
  }

  @Get()
  @Permissions('student.read')
  findAll(
    @User('org') organizationId: string,
    @Query() filters: any
  ) {
    return this.studentsService.findAll(organizationId, filters);
  }

  @Get(':id')
  @Permissions('student.read')
  findOne(@User('org') organizationId: string, @Param('id') id: string) {
    return this.studentsService.findOne(organizationId, id);
  }

  @Patch(':id')
  @Permissions('student.update')
  update(
    @User('org') organizationId: string,
    @Param('id') id: string,
    @Body() data: any,
    @User('id') actorId: string
  ) {
    return this.studentsService.update(organizationId, id, data, actorId);
  }

  @Patch(':id/status')
  @Permissions('student.update')
  updateStatus(
    @User('org') organizationId: string,
    @Param('id') id: string,
    @Body('status') status: StudentStatus,
    @Body('notes') notes: string,
    @User('id') actorId: string
  ) {
    return this.studentsService.updateStatus(organizationId, id, status, actorId, notes);
  }
}
