import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';
import { User } from '../../../auth/decorators/user.decorator';
import { FeeCollectionService } from './fee-collection.service';
import { FeeReminderStatus } from '@prisma/client';

@Controller('finance/collection')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class FeeCollectionController {
  constructor(private readonly service: FeeCollectionService) {}

  @Post('late-fee-rules')
  @Permissions('fees.manage')
  createRule(@User('org') org: string, @Body() data: any, @User('id') actor: string) {
    return this.service.createLateFeeRule(org, data.schoolId, data, actor);
  }

  @Get('late-fee-rules')
  @Permissions('fees.read')
  rules(@User('org') org: string, @Query('schoolId') schoolId: string) {
    return this.service.listLateFeeRules(org, schoolId);
  }

  @Post('process-overdues')
  @Permissions('fees.manage')
  overdue(@User('org') org: string, @Body() data: any, @User('id') actor: string) {
    return this.service.processOverdues(org, data.schoolId, data.asOf ? new Date(data.asOf) : new Date(), actor);
  }

  @Get('aging')
  @Permissions('fees.read')
  aging(@User('org') org: string, @Query('schoolId') schoolId: string) {
    return this.service.agingSummary(org, schoolId);
  }

  @Post('reminders/queue')
  @Permissions('fees.manage')
  reminders(@User('org') org: string, @Body() data: any, @User('id') actor: string) {
    return this.service.queueReminders(org, data.schoolId, data, actor);
  }

  @Get('reminders')
  @Permissions('fees.read')
  listReminders(@User('org') org: string, @Query('schoolId') schoolId: string, @Query('status') status?: FeeReminderStatus) {
    return this.service.listReminders(org, schoolId, status);
  }
}
