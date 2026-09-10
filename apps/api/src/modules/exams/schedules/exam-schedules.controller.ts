import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ExamSchedulesService } from './exam-schedules.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('exams/schedules')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ExamSchedulesController {
  constructor(private readonly service: ExamSchedulesService) {}

  @Post()
  @Permissions('exams.schedule')
  create(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.create(organizationId, data, actorId);
  }

  @Get('examination/:examinationId')
  @Permissions('exams.read')
  findByExam(@User('org') organizationId: string, @Param('examinationId') examinationId: string) {
    return this.service.findByExam(organizationId, examinationId);
  }
}
