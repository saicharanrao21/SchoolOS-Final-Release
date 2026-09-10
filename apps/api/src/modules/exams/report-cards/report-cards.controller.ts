import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ReportCardsService } from './report-cards.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('exams/report-cards')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ReportCardsController {
  constructor(private readonly service: ReportCardsService) {}

  @Post('generate')
  @Permissions('student.reportcard.manage')
  async generate(
    @User('org') organizationId: string,
    @User('id') actorId: string,
    @Body() body: { examinationId: string; classId: string; sectionId: string },
  ) {
    return this.service.generateReportCards(organizationId, body.examinationId, body.classId, body.sectionId, actorId);
  }

  @Get('student/:studentId')
  @Permissions('student.reportcard.read')
  async getStudentReportCards(
    @Param('studentId') studentId: string,
    @User('id') requestingUserId: string,
  ) {
    return this.service.getStudentReportCards(studentId, requestingUserId);
  }
}
