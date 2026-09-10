import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { PayrollSalariesService } from '../salaries/payroll-salaries.service';
import { AccountingIntegrationService } from '../../accounting/accounting-integration.service';
import { PayrollStatus } from '@prisma/client';

@Injectable()
export class PayrollRunsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
    private readonly salaryService: PayrollSalariesService,
    private readonly accounting: AccountingIntegrationService,
  ) {}

  async createPeriod(organizationId: string, data: any, actorId: string) {
    const period = await this.db.payrollPeriod.create({
      data: {
        year: data.year,
        month: data.month,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        schoolId: data.schoolId,
        status: PayrollStatus.DRAFT,
      },
    });

    await this.audit.log({
      action: 'payroll.period.create',
      resource: 'PayrollPeriod',
      resourceId: period.id,
      actorId,
      organizationId,
    });

    return period;
  }

  async runPayroll(organizationId: string, periodId: string, actorId: string) {
    const period = await this.db.payrollPeriod.findUnique({
      where: { id: periodId },
      include: { school: true },
    });

    if (!period || period.status === PayrollStatus.LOCKED) {
      throw new BadRequestException('Invalid period or already locked');
    }

    const assignments = await this.db.employeeSalaryAssignment.findMany({
      where: {
        structure: { schoolId: period.schoolId },
        isActive: true,
        effectiveFrom: { lte: period.endDate },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: period.startDate } },
        ],
      },
      include: { employee: true },
    });

    return this.db.$transaction(async (tx: any) => {
      for (const assign of assignments) {
        const result = await this.salaryService.calculatePayrollResult(
          assign.employeeId,
          assign.structureId,
          periodId,
        );

        await tx.payrollEmployeeResult.upsert({
          where: {
            periodId_employeeId: {
              periodId,
              employeeId: assign.employeeId,
            },
          },
          update: {
            grossEarnings: result.grossEarnings,
            totalDeductions: result.totalDeductions,
            netSalary: result.netSalary,
            calculationDetail: result.calculationDetail as any,
            payableDays: 30,
            workedDays: 30,
            unpaidLeaveDays: 0,
          },
          create: {
            periodId,
            employeeId: assign.employeeId,
            grossEarnings: result.grossEarnings,
            totalDeductions: result.totalDeductions,
            netSalary: result.netSalary,
            calculationDetail: result.calculationDetail as any,
            payableDays: 30,
            workedDays: 30,
            unpaidLeaveDays: 0,
          },
        });
      }

      await tx.payrollPeriod.update({
        where: { id: periodId },
        data: { status: PayrollStatus.CALCULATED },
      });

      return { success: true, count: assignments.length };
    });
  }

  async approveAndLock(organizationId: string, periodId: string, actorId: string) {
    const period = await this.db.payrollPeriod.findUnique({
      where: { id: periodId },
      include: { results: true },
    });

    if (!period || period.status !== PayrollStatus.CALCULATED) {
      throw new BadRequestException('Payroll must be calculated before approval');
    }

    return this.db.$transaction(async (tx: any) => {
      const updated = await tx.payrollPeriod.update({
        where: { id: periodId },
        data: { status: PayrollStatus.LOCKED, paymentDate: new Date() },
      });

      const totalNet = period.results.reduce((sum: number, r: any) => sum + Number(r.netSalary), 0);
      const totalGross = period.results.reduce((sum: number, r: any) => sum + Number(r.grossEarnings), 0);

      await this.accounting.handlePayrollPayment(organizationId, {
        periodId,
        totalNet,
        totalGross,
        schoolId: period.schoolId,
        actorId,
      });

      await this.audit.log({
        action: 'payroll.lock',
        resource: 'PayrollPeriod',
        resourceId: periodId,
        actorId,
        organizationId,
        metadata: { totalNet, totalGross },
      });

      return updated;
    });
  }

  async getEmployeePayslip(userId: string, periodId: string) {
    const employee = await this.db.employee.findUnique({ where: { userId } });
    if (!employee) throw new NotFoundException('Employee not found');

    const result = await this.db.payrollEmployeeResult.findUnique({
      where: { periodId_employeeId: { periodId, employeeId: employee.id } },
      include: { period: true },
    });

    if (!result || result.period.status !== PayrollStatus.LOCKED) {
      throw new NotFoundException('Payslip not available or payroll not locked');
    }

    return result;
  }
}
