import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { SalaryComponentType, CalculationMethod } from '@prisma/client';

@Injectable()
export class PayrollSalariesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async createStructure(organizationId: string, data: any, actorId: string) {
    const structure = await this.db.salaryStructure.create({
      data: {
        name: data.name,
        schoolId: data.schoolId,
        components: {
          create: data.components.map((c: any) => ({
            name: c.name,
            code: c.code,
            type: c.type as SalaryComponentType,
            method: c.method as CalculationMethod,
            amount: c.amount,
            percentage: c.percentage,
            baseComponentCode: c.baseComponentCode,
            isTaxable: c.isTaxable ?? true,
            isStatutory: c.isStatutory ?? false,
          })),
        },
      },
      include: { components: true },
    });

    await this.audit.log({
      action: 'payroll.structure.create',
      resource: 'SalaryStructure',
      resourceId: structure.id,
      actorId,
      organizationId,
    });

    return structure;
  }

  async assignToEmployee(organizationId: string, data: any, actorId: string) {
    const existing = await this.db.employeeSalaryAssignment.findFirst({
      where: {
        employeeId: data.employeeId,
        effectiveFrom: { lte: new Date(data.effectiveFrom) },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: new Date(data.effectiveFrom) } },
        ],
      },
    });

    if (existing) {
      throw new BadRequestException('Employee already has an active salary assignment for this period');
    }

    return this.db.employeeSalaryAssignment.create({
      data: {
        employeeId: data.employeeId,
        structureId: data.structureId,
        effectiveFrom: new Date(data.effectiveFrom),
        effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null,
      },
    });
  }

  async calculatePayrollResult(employeeId: string, structureId: string, periodId: string) {
    const structure = await this.db.salaryStructure.findUnique({
      where: { id: structureId },
      include: { components: true },
    });

    if (!structure) throw new NotFoundException('Salary structure not found');

    const period = await this.db.payrollPeriod.findUnique({ where: { id: periodId } });
    if (!period) throw new NotFoundException('Payroll period not found');

    const componentValues: Record<string, number> = {};
    const earnings: Record<string, number> = {};
    const deductions: Record<string, number> = {};

    for (const comp of structure.components.filter((c: any) => c.method === CalculationMethod.FIXED)) {
      const val = Number(comp.amount || 0);
      componentValues[comp.code] = val;
      if (comp.type === SalaryComponentType.EARNING) earnings[comp.code] = val;
      else deductions[comp.code] = val;
    }

    for (const comp of structure.components.filter((c: any) => c.method === CalculationMethod.PERCENTAGE)) {
      const baseVal = comp.baseComponentCode ? (componentValues[comp.baseComponentCode] || 0) : 0;
      const val = baseVal * ((comp.percentage || 0) / 100);
      componentValues[comp.code] = val;
      if (comp.type === SalaryComponentType.EARNING) earnings[comp.code] = val;
      else deductions[comp.code] = val;
    }

    const grossEarnings = Object.values(earnings).reduce((a: number, b: number) => a + b, 0);
    const totalDeductions = Object.values(deductions).reduce((a: number, b: number) => a + b, 0);
    const netSalary = grossEarnings - totalDeductions;

    return {
      grossEarnings,
      totalDeductions,
      netSalary,
      calculationDetail: { earnings, deductions },
    };
  }
}
