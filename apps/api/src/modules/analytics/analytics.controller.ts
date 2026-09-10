import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('analytics')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('executive')
  @Permissions('analytics.executive.read')
  async getExecutive(@User('org') organizationId: string, @Query('schoolId') schoolId: string) {
    return this.service.getExecutiveKpis(organizationId, schoolId);
  }

  @Get('students')
  @Permissions('analytics.students.read')
  async getStudents(@User('org') organizationId: string, @Query('schoolId') schoolId: string) {
    return this.service.getStudentAnalytics(organizationId, schoolId);
  }

  @Get('finance')
  @Permissions('analytics.finance.read')
  async getFinance(@User('org') organizationId: string, @Query('schoolId') schoolId: string) {
    return this.service.getFinanceAnalytics(organizationId, schoolId);
  }

  @Get('attendance')
  @Permissions('analytics.attendance.read')
  async getAttendance(@User('org') organizationId: string, @Query('schoolId') schoolId: string) {
    return this.service.getAttendanceAnalytics(organizationId, schoolId);
  }

  @Get('academics')
  @Permissions('analytics.academics.read')
  async getAcademics(@User('org') organizationId: string, @Query('schoolId') schoolId: string) {
    return this.service.getAcademicAnalytics(organizationId, schoolId);
  }
}
