import { Controller, Post, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { ResultsService } from './results.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('exams/results')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ResultsController {
  constructor(private readonly service: ResultsService) {}

  @Post('calculate')
  @Permissions('results.calculate')
  calculate(
    @User('org') organizationId: string,
    @Body('examinationId') examinationId: string,
    @Body('classId') classId: string,
    @Body('sectionId') sectionId: string,
    @User('id') actorId: string
  ) {
    return this.service.calculateResults(organizationId, examinationId, classId, sectionId, actorId);
  }

  @Patch('publish')
  @Permissions('results.publish')
  publish(
    @User('org') organizationId: string,
    @Body('examinationId') examinationId: string,
    @Body('classId') classId: string,
    @User('id') actorId: string
  ) {
    return this.service.publish(organizationId, examinationId, classId, actorId);
  }
}
