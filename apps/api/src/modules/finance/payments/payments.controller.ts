import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('finance/payments')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post('collect')
  @Permissions('fees.collect')
  collect(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.collect(organizationId, data, actorId);
  }

  @Get('student/:studentId')
  @Permissions('fees.read')
  getStudentPayments(@User('org') organizationId: string, @Param('studentId') studentId: string) {
    return this.service.getStudentPayments(organizationId, studentId);
  }
}
