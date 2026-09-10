import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('teacher')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class TeacherController {
  constructor(private readonly service: TeacherService) {}

  @Get('dashboard')
  @Permissions('teacher.dashboard.read')
  getDashboard(@User('id') userId: string) {
    return this.service.getDashboard(userId);
  }

  @Get('profile')
  @Permissions('teacher.profile.read')
  getProfile(@User('id') userId: string) {
    return this.service.getEmployeeByUserId(userId);
  }

  @Get('classes')
  @Permissions('teacher.class.read')
  getClasses(@User('id') userId: string) {
    return this.service.getClasses(userId);
  }

  @Get('classes/:classId/sections/:sectionId/students')
  @Permissions('teacher.student.read')
  getClassStudents(
    @User('id') userId: string,
    @Param('classId') classId: string,
    @Param('sectionId') sectionId: string,
  ) {
    return this.service.getClassStudents(userId, classId, sectionId);
  }

  @Get('timetable')
  @Permissions('timetable.read')
  getTimetable(@User('id') userId: string) {
    return this.service.getTimetable(userId);
  }
}
