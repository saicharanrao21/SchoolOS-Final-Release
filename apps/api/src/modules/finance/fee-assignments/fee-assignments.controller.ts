import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { FeeAssignmentsService } from './fee-assignments.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('finance/fee-assignments')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class FeeAssignmentsController {
  constructor(private readonly service: FeeAssignmentsService) {}

  @Post('student')
  @Permissions('fees.assign')
  assignToStudent(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.assignToStudent(organizationId, data, actorId);
  }
}
