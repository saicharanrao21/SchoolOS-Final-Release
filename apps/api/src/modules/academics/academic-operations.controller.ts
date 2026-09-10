import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { PolicyGuard } from '../../auth/guards/policy.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { User } from '../../auth/decorators/user.decorator';
import { AcademicsOperationsService } from './academic-operations.service';

@Controller('management/academic-operations')
@UseGuards(AuthGuard('jwt'), PermissionsGuard, PolicyGuard)
export class AcademicOperationsController {
  constructor(private readonly operationsService: AcademicsOperationsService) {}

  @Post('promote')
  @Permissions('academics.manage')
  promoteStudent(
    @User('org') organizationId: string,
    @User('id') actorId: string,
    @Body() body: any,
  ) {
    return this.operationsService.promoteStudent(organizationId, actorId, body);
  }

  @Post('bulk-promote')
  @Permissions('academics.manage')
  bulkPromoteStudents(
    @User('org') organizationId: string,
    @User('id') actorId: string,
    @Body() body: any,
  ) {
    return this.operationsService.bulkPromoteStudents(organizationId, actorId, body);
  }

  @Post('rollover')
  @Permissions('academics.manage')
  rolloverAcademicYear(
    @User('org') organizationId: string,
    @User('id') actorId: string,
    @Body() body: { schoolId: string; fromYearId: string; toYearId: string },
  ) {
    return this.operationsService.rolloverAcademicYear(
      organizationId,
      body.schoolId,
      actorId,
      body.fromYearId,
      body.toYearId,
    );
  }

  @Get('teacher-workload/:employeeId')
  @Permissions('academics.read')
  getTeacherWorkload(
    @User('org') organizationId: string,
    @Param('employeeId') employeeId: string,
    @Query('schoolId') schoolId: string,
  ) {
    return this.operationsService.getTeacherWorkload(organizationId, schoolId, employeeId);
  }
}
