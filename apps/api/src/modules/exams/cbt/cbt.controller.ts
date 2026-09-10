import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';
import { User } from '../../../auth/decorators/user.decorator';
import { CbtExamService } from './cbt.service';

@Controller('exams/cbt')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class CbtExamController {
  constructor(private readonly service: CbtExamService) {}

  // --- Question Bank ---

  @Get('questions')
  @Permissions('exams.read')
  async getQuestions(
    @User('org') organizationId: string,
    @Query('schoolId') schoolId: string,
    @Query('subjectId') subjectId?: string,
  ) {
    return this.service.getQuestions(organizationId, schoolId, subjectId);
  }

  @Post('questions')
  @Permissions('exams.manage')
  async createQuestion(
    @User('org') organizationId: string,
    @Query('schoolId') schoolId: string,
    @Body() data: any,
    @User('id') actorId: string,
  ) {
    return this.service.createQuestion(organizationId, schoolId, data, actorId);
  }

  // --- CBT Exams ---

  @Get('exams')
  @Permissions('exams.read')
  async getCbtExams(
    @User('org') organizationId: string,
    @Query('schoolId') schoolId: string,
    @Query('classId') classId?: string,
  ) {
    return this.service.getCbtExams(organizationId, schoolId, classId);
  }

  @Post('exams')
  @Permissions('exams.manage')
  async createCbtExam(
    @User('org') organizationId: string,
    @Query('schoolId') schoolId: string,
    @Body() data: any,
    @User('id') actorId: string,
  ) {
    return this.service.createCbtExam(organizationId, schoolId, data, actorId);
  }

  // --- Student Online CBT Attempts ---

  @Post('exams/:id/start')
  @Permissions('exams.read')
  async startAttempt(
    @User('org') organizationId: string,
    @Param('id') cbtExamId: string,
    @User('id') userId: string,
  ) {
    return this.service.startAttempt(organizationId, cbtExamId, userId);
  }

  @Post('attempts/:id/submit')
  @Permissions('exams.read')
  async submitAttempt(
    @User('org') organizationId: string,
    @Param('id') attemptId: string,
    @User('id') userId: string,
    @Body('answers') answers: Record<string, string>,
  ) {
    return this.service.submitAttempt(organizationId, attemptId, userId, answers);
  }
}
