import { Controller, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { AttendanceCorrectionsService } from './corrections.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';
import { CorrectionStatus } from '@prisma/client';

@Controller('attendance/corrections')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class AttendanceCorrectionsController {
  constructor(private readonly service: AttendanceCorrectionsService) {}

  @Post('request')
  @Permissions('attendance.correct')
  request(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.request(organizationId, data, actorId);
  }

  @Patch(':id/review')
  @Permissions('attendance.approve')
  review(
    @User('org') organizationId: string,
    @Param('id') id: string,
    @Body('status') status: CorrectionStatus,
    @User('id') actorId: string
  ) {
    return this.service.review(organizationId, id, status, actorId);
  }
}
