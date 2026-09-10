import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { StudentsService } from './students.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { PolicyGuard } from '../../auth/guards/policy.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { StudentStatus } from '@prisma/client';

@Controller('students')
@UseGuards(AuthGuard('jwt'), PermissionsGuard, PolicyGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Permissions('students.manage')
  create(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.studentsService.create(organizationId, data, actorId);
  }

  @Get()
  @Permissions('students.read')
  findAll(
    @User('org') organizationId: string,
    @Query() filters: any,
  ) {
    return this.studentsService.findAll(organizationId, filters);
  }

  @Get('duplicates')
  @Permissions('students.read')
  detectDuplicates(
    @User('org') organizationId: string,
    @Query('schoolId') schoolId?: string,
  ) {
    return this.studentsService.detectDuplicates(organizationId, schoolId);
  }

  @Get(':id/360')
  @Permissions('students.read')
  getStudent360(
    @User('org') organizationId: string,
    @Param('id') id: string,
    @User() requestingUser: any,
  ) {
    return this.studentsService.getStudent360(organizationId, id, requestingUser);
  }

  @Get(':id')
  @Permissions('students.read')
  findOne(@User('org') organizationId: string, @Param('id') id: string) {
    return this.studentsService.findOne(organizationId, id);
  }

  @Post(':id/transfer')
  @Permissions('students.manage')
  transfer(
    @User('org') organizationId: string,
    @Param('id') id: string,
    @Body() transferData: any,
    @User('id') actorId: string,
  ) {
    return this.studentsService.transferStudent(organizationId, id, actorId, transferData);
  }

  @Post(':id/notes')
  @Permissions('students.manage')
  addNote(
    @User('org') organizationId: string,
    @Param('id') id: string,
    @User('id') authorId: string,
    @Body() data: any,
  ) {
    return this.studentsService.addStudentNote(organizationId, id, authorId, data);
  }

  @Patch(':id')
  @Permissions('students.manage')
  update(
    @User('org') organizationId: string,
    @Param('id') id: string,
    @Body() data: any,
    @User('id') actorId: string,
  ) {
    return this.studentsService.update(organizationId, id, data, actorId);
  }

  @Patch(':id/status')
  @Permissions('students.manage')
  updateStatus(
    @User('org') organizationId: string,
    @Param('id') id: string,
    @Body('status') status: StudentStatus,
    @Body('notes') notes: string,
    @User('id') actorId: string,
  ) {
    return this.studentsService.updateStatus(organizationId, id, status, actorId, notes);
  }
}
