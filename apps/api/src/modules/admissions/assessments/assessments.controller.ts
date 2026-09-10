import { Controller, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('admissions/assessments')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Post()
  @Permissions('admissions.assessment.manage')
  create(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.assessmentsService.create(organizationId, data, actorId);
  }

  @Patch(':id/result')
  @Permissions('admissions.assessment.manage')
  updateResult(@User('org') organizationId: string, @Param('id') id: string, @Body() data: any, @User('id') actorId: string) {
    return this.assessmentsService.updateResult(organizationId, id, data, actorId);
  }
}
