import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { ParentService } from './parent.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../auth/decorators/user.decorator';

@Controller('parent')
@UseGuards(AuthGuard('jwt'))
export class ParentController {
  constructor(private readonly service: ParentService) {}

  @Get('children')
  async getChildren(@User('id') userId: string) {
    return this.service.getChildren(userId);
  }

  @Get('children/:id/dashboard')
  async getChildDashboard(@User('id') userId: string, @Param('id') studentId: string) {
    return this.service.getChildDashboard(userId, studentId);
  }

  @Get('children/:id/attendance')
  async getChildAttendance(
    @User('id') userId: string,
    @Param('id') studentId: string,
    @Query('academicYearId') academicYearId: string
  ) {
    return this.service.getChildAttendance(userId, studentId, academicYearId);
  }

  @Get('children/:id/academics')
  async getChildAcademics(@User('id') userId: string, @Param('id') studentId: string) {
    return this.service.getChildAcademics(userId, studentId);
  }

  @Get('children/:id/exams')
  async getChildExams(@User('id') userId: string, @Param('id') studentId: string) {
    return this.service.getChildExams(userId, studentId);
  }

  @Get('children/:id/finance')
  async getChildFinance(@User('id') userId: string, @Param('id') studentId: string) {
    return this.service.getChildFinance(userId, studentId);
  }

  @Get('children/:id/transport')
  async getChildTransport(@User('id') userId: string, @Param('id') studentId: string) {
    return this.service.getChildTransport(userId, studentId);
  }
}
