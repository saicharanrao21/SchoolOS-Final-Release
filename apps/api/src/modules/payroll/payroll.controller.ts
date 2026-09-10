import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { PayrollRunsService } from './runs/payroll-runs.service';
import { PayrollSalariesService } from './salaries/payroll-salaries.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('payroll')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class PayrollController {
  constructor(
    private readonly runsService: PayrollRunsService,
    private readonly salaryService: PayrollSalariesService,
  ) {}

  @Post('periods')
  @Permissions('payroll.calculate')
  async createPeriod(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.runsService.createPeriod(organizationId, data, actorId);
  }

  @Post('periods/:id/run')
  @Permissions('payroll.calculate')
  async runPayroll(@User('org') organizationId: string, @Param('id') id: string, @User('id') actorId: string) {
    return this.runsService.runPayroll(organizationId, id, actorId);
  }

  @Post('periods/:id/approve')
  @Permissions('payroll.approve')
  async approve(@User('org') organizationId: string, @Param('id') id: string, @User('id') actorId: string) {
    return this.runsService.approveAndLock(organizationId, id, actorId);
  }

  @Post('structures')
  @Permissions('hr.salary.manage')
  async createStructure(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.salaryService.createStructure(organizationId, data, actorId);
  }

  @Post('assignments')
  @Permissions('hr.salary.manage')
  async assign(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.salaryService.assignToEmployee(organizationId, data, actorId);
  }

  @Get('my-payslips')
  async getMyPayslips(@User('id') userId: string, @Query('periodId') periodId: string) {
    return this.runsService.getEmployeePayslip(userId, periodId);
  }
}
