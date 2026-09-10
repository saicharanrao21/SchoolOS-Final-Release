import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { StudentAccountService } from './student-account.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('finance/student-accounts')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class StudentAccountController {
  constructor(private readonly service: StudentAccountService) {}

  @Get(':studentId/summary')
  @Permissions('fees.read')
  getAccountSummary(@User('org') organizationId: string, @Param('studentId') studentId: string) {
    return this.service.getAccountSummary(organizationId, studentId);
  }

  @Post('concession')
  @Permissions('fees.discount')
  applyConcession(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.applyConcession(organizationId, data, actorId);
  }
}
