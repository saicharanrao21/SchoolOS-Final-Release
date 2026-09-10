import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';
import { User } from '../../../auth/decorators/user.decorator';
import { BankStatementStatus } from '@prisma/client';
import { BankReconciliationService } from './bank-reconciliation.service';

@Controller('accounting/bank-reconciliation')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class BankReconciliationController {
  constructor(private readonly service: BankReconciliationService) {}

  @Get('summary') @Permissions('accounting.bank_reconciliation.read')
  summary(@User('org') org: string, @Query('schoolId') schoolId: string) { return this.service.summary(org, schoolId); }

  @Post('statements/import') @Permissions('accounting.bank_reconciliation.manage')
  import(@User('org') org: string, @Body() data: any, @User('id') actor: string) { return this.service.importStatement(org, data, actor); }

  @Get('statements') @Permissions('accounting.bank_reconciliation.read')
  list(@User('org') org: string, @Query('schoolId') schoolId: string, @Query('status') status?: BankStatementStatus) { return this.service.listStatements(org, schoolId, status); }

  @Get('statements/:id') @Permissions('accounting.bank_reconciliation.read')
  get(@User('org') org: string, @Param('id') id: string) { return this.service.getStatement(org, id); }

  @Post('statements/:id/auto-match') @Permissions('accounting.bank_reconciliation.manage')
  autoMatch(@User('org') org: string, @Param('id') id: string, @User('id') actor: string) { return this.service.autoMatch(org, id, actor); }

  @Post('transactions/:id/match') @Permissions('accounting.bank_reconciliation.manage')
  match(@User('org') org: string, @Param('id') id: string, @Body() data: any, @User('id') actor: string) { return this.service.reconcile(org, id, data.paymentId, data.amount, actor, data.matchMethod || 'MANUAL', data.confidence); }

  @Patch('transactions/:id/exclude') @Permissions('accounting.bank_reconciliation.manage')
  exclude(@User('org') org: string, @Param('id') id: string, @Body('reason') reason: string, @User('id') actor: string) { return this.service.excludeTransaction(org, id, actor, reason); }

  @Post('statements/:id/close') @Permissions('accounting.bank_reconciliation.manage')
  close(@User('org') org: string, @Param('id') id: string, @User('id') actor: string) { return this.service.closeStatement(org, id, actor); }
}
