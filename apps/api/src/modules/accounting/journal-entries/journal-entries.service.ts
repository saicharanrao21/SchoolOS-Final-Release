import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { Prisma, JournalEntryStatus } from '@prisma/client';

@Injectable()
export class JournalEntriesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async create(organizationId: string, data: any, actorId: string) {
    const { schoolId, journalId, date, description, lines, sourceType, sourceId } = data;

    const school = await this.db.school.findFirst({
      where: { id: schoolId, organizationId },
    });
    if (!school) throw new NotFoundException('School not found');

    // Find active fiscal year and period
    const postingDate = new Date(date || new Date());
    const fiscalYear = await this.db.fiscalYear.findFirst({
      where: {
        schoolId,
        startDate: { lte: postingDate },
        endDate: { gte: postingDate },
        status: 'OPEN',
      },
      include: { periods: true },
    });

    if (!fiscalYear) {
      throw new BadRequestException('No open fiscal year found for the selected date');
    }

    const period = fiscalYear.periods.find(p =>
      postingDate >= p.startDate && postingDate <= p.endDate && p.status === 'OPEN'
    );

    if (!period) {
      throw new BadRequestException('The accounting period for this date is closed or locked');
    }

    // Validate Double Entry (Total Debits = Total Credits)
    const totalDebit = lines.reduce((sum: number, l: any) => sum + parseFloat(l.debit || 0), 0);
    const totalCredit = lines.reduce((sum: number, l: any) => sum + parseFloat(l.credit || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      throw new BadRequestException('Journal entry is not balanced (Debits must equal Credits)');
    }

    if (totalDebit === 0) {
      throw new BadRequestException('Journal entry cannot be empty');
    }

    return this.db.$transaction(async (tx: Prisma.TransactionClient) => {
      const entryNumber = await this.generateEntryNumber(tx, schoolId);

      const entry = await tx.journalEntry.create({
        data: {
          entryNumber,
          date: postingDate,
          description,
          journalId,
          fiscalYearId: fiscalYear.id,
          periodId: period.id,
          status: JournalEntryStatus.POSTED,
          sourceType,
          sourceId,
          totalAmount: new Prisma.Decimal(totalDebit),
          createdById: actorId,
          lines: {
            create: lines.map((l: any) => ({
              accountId: l.accountId,
              debit: new Prisma.Decimal(l.debit || 0),
              credit: new Prisma.Decimal(l.credit || 0),
              description: l.description,
              costCenterId: l.costCenterId,
            })),
          },
        },
        include: { lines: { include: { account: true } } },
      });

      await this.audit.log({
        action: 'accounting.journal_entry.post',
        resource: 'JournalEntry',
        resourceId: entry.id,
        actorId,
        organizationId,
        schoolId,
        metadata: { entryNumber, total: totalDebit },
      });

      return entry;
    });
  }

  private async generateEntryNumber(tx: any, schoolId: string): Promise<string> {
    const year = new Date().getFullYear().toString();
    const count = await tx.journalEntry.count({
      where: { journal: { schoolId } },
    });
    return `JE-${year}-${(count + 1).toString().padStart(6, '0')}`;
  }

  async findAll(organizationId: string, filters: any) {
    return this.db.journalEntry.findMany({
      where: {
        journal: { schoolId: filters.schoolId, school: { organizationId } },
        fiscalYearId: filters.fiscalYearId,
        periodId: filters.periodId,
      },
      include: {
        journal: true,
        lines: { include: { account: true } },
        fiscalYear: true,
        period: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const entry = await this.db.journalEntry.findFirst({
      where: {
        id,
        journal: { school: { organizationId } },
      },
      include: {
        lines: { include: { account: true, costCenter: true } },
        journal: true,
        fiscalYear: true,
        period: true,
      },
    });
    if (!entry) throw new NotFoundException('Journal entry not found');
    return entry;
  }
}
