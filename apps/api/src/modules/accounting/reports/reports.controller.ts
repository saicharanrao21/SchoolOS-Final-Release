import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AccountingReportsService } from './reports.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('accounting/reports')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class AccountingReportsController {
  constructor(private readonly service: AccountingReportsService) {}

  @Get('trial-balance')
  @Permissions('accounting.read')
  getTrialBalance(
    @User('org') organizationId: string,
    @Query('schoolId') schoolId: string,
    @Query('fiscalYearId') fiscalYearId: string
  ) {
    return this.service.getTrialBalance(organizationId, schoolId, fiscalYearId);
  }

  @Get('profit-loss')
  @Permissions('accounting.read')
  getProfitAndLoss(
    @User('org') organizationId: string,
    @Query('schoolId') schoolId: string,
    @Query('fiscalYearId') fiscalYearId: string
  ) {
    return this.service.getProfitAndLoss(organizationId, schoolId, fiscalYearId);
  }

  @Get('balance-sheet')
  @Permissions('accounting.read')
  getBalanceSheet(
    @User('org') organizationId: string,
    @Query('schoolId') schoolId: string,
    @Query('fiscalYearId') fiscalYearId: string
  ) {
    return this.service.getBalanceSheet(organizationId, schoolId, fiscalYearId);
  }
}
