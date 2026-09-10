import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { StudentsService } from './students.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { PolicyGuard } from '../../auth/guards/policy.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { StudentStatus } from '@prisma/client';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { TransferStudentDto } from './dto/transfer-student.dto';
import { CreateStudentNoteDto } from './dto/create-student-note.dto';
import { StudentFilterDto } from './dto/student-filter.dto';

@Controller('students')
@UseGuards(AuthGuard('jwt'), PermissionsGuard, PolicyGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Permissions('students.manage')
  create(
    @User('org') organizationId: string,
    @Body() dto: CreateStudentDto,
    @User('id') actorId: string,
  ) {
    return this.studentsService.create(organizationId, dto, actorId);
  }

  @Get()
  @Permissions('students.read')
  findAll(
    @User('org') organizationId: string,
    @Query() filters: StudentFilterDto,
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
    @Body() dto: TransferStudentDto,
    @User('id') actorId: string,
  ) {
    return this.studentsService.transferStudent(organizationId, id, actorId, dto);
  }

  @Post(':id/notes')
  @Permissions('students.manage')
  addNote(
    @User('org') organizationId: string,
    @Param('id') id: string,
    @User('id') authorId: string,
    @Body() dto: CreateStudentNoteDto,
  ) {
    return this.studentsService.addStudentNote(organizationId, id, authorId, dto);
  }

  @Patch(':id')
  @Permissions('students.manage')
  update(
    @User('org') organizationId: string,
    @Param('id') id: string,
    @Body() dto: UpdateStudentDto,
    @User('id') actorId: string,
  ) {
    return this.studentsService.update(organizationId, id, dto, actorId);
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
