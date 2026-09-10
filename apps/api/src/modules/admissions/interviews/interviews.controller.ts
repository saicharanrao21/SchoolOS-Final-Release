import { Controller, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';
import { InterviewStatus } from '@prisma/client';

@Controller('admissions/interviews')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post()
  @Permissions('admissions.interview.manage')
  schedule(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.interviewsService.schedule(organizationId, data, actorId);
  }

  @Patch(':id/status')
  @Permissions('admissions.interview.manage')
  updateStatus(
    @User('org') organizationId: string,
    @Param('id') id: string,
    @Body('status') status: InterviewStatus,
    @Body('outcome') outcome: string,
    @User('id') actorId: string
  ) {
    return this.interviewsService.updateStatus(organizationId, id, status, actorId, outcome);
  }
}
