import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { AttendanceRecordsService } from './records.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('attendance/records')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class AttendanceRecordsController {
  constructor(private readonly service: AttendanceRecordsService) {}

  @Post('bulk/:sessionId')
  @Permissions('attendance.mark')
  markBulk(
    @User('org') organizationId: string,
    @Param('sessionId') sessionId: string,
    @Body('records') records: any[],
    @User('id') actorId: string
  ) {
    return this.service.markBulk(organizationId, sessionId, records, actorId);
  }

  @Get('student/:studentId/stats')
  @Permissions('attendance.read')
  getStudentStats(
    @User('org') organizationId: string,
    @Param('studentId') studentId: string,
    @Query('academicYearId') academicYearId: string
  ) {
    return this.service.getStudentStats(organizationId, studentId, academicYearId);
  }

  @Get('school/:schoolId/daily-summary')
  @Permissions('attendance.read')
  getSchoolDailySummary(@User('org') organizationId: string, @Param('schoolId') schoolId: string, @Query('date') date?: string) {
    return this.service.getSchoolDailySummary(organizationId, schoolId, date);
  }

  @Get('school/:schoolId/at-risk')
  @Permissions('attendance.read')
  getAtRiskStudents(@User('org') organizationId: string, @Param('schoolId') schoolId: string, @Query('academicYearId') academicYearId: string, @Query('threshold') threshold?: string) {
    return this.service.getAtRiskStudents(organizationId, schoolId, academicYearId, threshold ? Number(threshold) : 75);
  }

  @Post('employee')
  @Permissions('attendance.mark')
  markEmployeeAttendance(
    @User('org') organizationId: string,
    @Body('schoolId') schoolId: string,
    @Body() data: any,
    @User('id') actorId: string
  ) {
    return this.service.markEmployeeAttendance(organizationId, schoolId, data, actorId);
  }
}
