import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { Prisma, FiscalYearStatus } from '@prisma/client';

@Injectable()
export class FiscalYearsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async create(organizationId: string, data: any, actorId: string) {
    const school = await this.db.school.findFirst({
      where: { id: data.schoolId, organizationId },
    });
    if (!school) throw new NotFoundException('School not found');

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Check for overlapping fiscal years
    const overlapping = await this.db.fiscalYear.findFirst({
      where: {
        schoolId: data.schoolId,
        OR: [
          { startDate: { lte: endDate }, endDate: { gte: startDate } },
        ],
      },
    });

    if (overlapping) {
      throw new BadRequestException('Fiscal year overlaps with an existing one');
    }

    return this.db.$transaction(async (tx: Prisma.TransactionClient) => {
      const fy = await tx.fiscalYear.create({
        data: {
          name: data.name,
          startDate,
          endDate,
          schoolId: data.schoolId,
          status: FiscalYearStatus.DRAFT,
        },
      });

      // Create 12 monthly periods
      const periods = [];
      for (let i = 1; i <= 12; i++) {
        const pStart = new Date(startDate);
        pStart.setMonth(pStart.getMonth() + (i - 1));
        const pEnd = new Date(pStart);
        pEnd.setMonth(pEnd.getMonth() + 1);
        pEnd.setDate(0); // Last day of month

        periods.push({
          fiscalYearId: fy.id,
          periodNumber: i,
          name: pStart.toLocaleString('default', { month: 'long', year: 'numeric' }),
          startDate: pStart,
          endDate: pEnd,
        });
      }

      await tx.accountingPeriod.createMany({
        data: periods,
      });

      await this.audit.log({
        action: 'accounting.fiscal_year.create',
        resource: 'FiscalYear',
        resourceId: fy.id,
        actorId,
        organizationId,
        schoolId: school.id,
      });

      return fy;
    });
  }

  async findAll(organizationId: string, schoolId: string) {
    return this.db.fiscalYear.findMany({
      where: {
        schoolId,
        school: { organizationId },
      },
      include: { periods: { orderBy: { periodNumber: 'asc' } } },
      orderBy: { startDate: 'desc' },
    });
  }

  async open(organizationId: string, id: string, actorId: string) {
    const fy = await this.db.fiscalYear.findUnique({ where: { id } });
    if (!fy) throw new NotFoundException('Fiscal Year not found');

    return this.db.$transaction(async (tx: Prisma.TransactionClient) => {
      // Unset previous current
      await tx.fiscalYear.updateMany({
        where: { schoolId: fy.schoolId, isCurrent: true },
        data: { isCurrent: false },
      });

      const updated = await tx.fiscalYear.update({
        where: { id },
        data: { status: FiscalYearStatus.OPEN, isCurrent: true },
      });

      await this.audit.log({
        action: 'accounting.fiscal_year.open',
        resource: 'FiscalYear',
        resourceId: id,
        actorId,
        organizationId,
        schoolId: fy.schoolId,
      });

      return updated;
    });
  }
}
