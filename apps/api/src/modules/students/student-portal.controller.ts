import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { StudentApiService } from './student-api.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../auth/decorators/user.decorator';

@Controller('student/portal')
@UseGuards(AuthGuard('jwt'))
export class StudentPortalController {
  constructor(private readonly service: StudentApiService) {}

  @Get('profile')
  async getProfile(@User('id') userId: string) {
    return this.service.getStudentProfile(userId);
  }

  @Get('dashboard')
  async getDashboard(@User('id') userId: string) {
    return this.service.getDashboard(userId);
  }

  @Get('timetable')
  async getTimetable(@User('id') userId: string) {
    return this.service.getTimetable(userId);
  }

  @Get('homework')
  async getHomework(@User('id') userId: string) {
    return this.service.getHomework(userId);
  }

  @Get('results')
  async getResults(@User('id') userId: string) {
    return this.service.getResults(userId);
  }

  @Get('attendance')
  async getAttendance(
    @User('id') userId: string,
    @Query('academicYearId') academicYearId?: string
  ) {
    return this.service.getAttendance(userId, academicYearId);
  }
}
