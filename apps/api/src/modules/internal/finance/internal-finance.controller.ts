import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { InternalFinanceService } from './internal-finance.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('internal/finance')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class InternalFinanceController {
  constructor(private readonly service: InternalFinanceService) {}

  @Post('categories')
  @Permissions('internal.finance.manage')
  async createCategory(@Body() data: any) {
    return this.service.createCategory(data);
  }

  @Post('expenses')
  @Permissions('internal.finance.read')
  async createExpenseClaim(
    @User('org') organizationId: string,
    @User('id') actorId: string,
    @Body() data: any,
  ) {
    return this.service.createExpenseClaim(organizationId, data, actorId);
  }

  @Patch('expenses/:id/approve')
  @Permissions('internal.expenses.approve')
  async approveExpenseClaim(
    @User('org') organizationId: string,
    @User('id') actorId: string,
    @Param('id') id: string,
  ) {
    return this.service.approveExpenseClaim(organizationId, id, actorId);
  }

  @Patch('expenses/:id/pay')
  @Permissions('internal.finance.manage')
  async payExpenseClaim(
    @User('org') organizationId: string,
    @User('id') actorId: string,
    @Param('id') id: string,
  ) {
    return this.service.payExpenseClaim(organizationId, id, actorId);
  }

  @Get('expenses')
  @Permissions('internal.finance.read')
  async getExpenses(@User('org') organizationId: string) {
    return this.service.getExpenses(organizationId);
  }

  @Get('summary')
  @Permissions('internal.finance.read')
  async getSummary(@User('org') organizationId: string) {
    return this.service.getFinanceSummary(organizationId);
  }
}
