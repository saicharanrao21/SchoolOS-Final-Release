import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { Prisma, AccountType } from '@prisma/client';

@Injectable()
export class AccountsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async create(organizationId: string, data: any, actorId: string) {
    const school = await this.db.school.findFirst({
      where: { id: data.schoolId, organizationId },
    });
    if (!school) throw new NotFoundException('School not found');

    // Check code uniqueness within school
    const existing = await this.db.chartOfAccount.findUnique({
      where: { schoolId_code: { schoolId: data.schoolId, code: data.code } },
    });
    if (existing) throw new BadRequestException('Account code already exists in this school');

    const account = await this.db.chartOfAccount.create({
      data: {
        code: data.code,
        name: data.name,
        type: data.type,
        parentAccountId: data.parentAccountId,
        schoolId: data.schoolId,
        isSystem: data.isSystem || false,
      },
    });

    await this.audit.log({
      action: 'accounting.account.create',
      resource: 'ChartOfAccount',
      resourceId: account.id,
      actorId,
      organizationId,
      schoolId: school.id,
      metadata: { code: account.code, name: account.name },
    });

    return account;
  }

  async findAll(organizationId: string, schoolId: string) {
    return this.db.chartOfAccount.findMany({
      where: {
        schoolId,
        school: { organizationId },
      },
      include: {
        parentAccount: true,
        _count: { select: { journalLines: true } }
      },
      orderBy: { code: 'asc' },
    });
  }

  async findByType(organizationId: string, schoolId: string, type: AccountType) {
    return this.db.chartOfAccount.findMany({
      where: { schoolId, type, isActive: true },
      orderBy: { code: 'asc' },
    });
  }

  async getAccountBalance(id: string, fiscalYearId?: string) {
    const lines = await this.db.journalLine.findMany({
      where: {
        accountId: id,
        journalEntry: fiscalYearId ? { fiscalYearId } : undefined,
      },
      select: { debit: true, credit: true },
    });

    return lines.reduce((acc: { debit: Prisma.Decimal, credit: Prisma.Decimal }, line: { debit: Prisma.Decimal, credit: Prisma.Decimal }) => {
      acc.debit = acc.debit.add(line.debit);
      acc.credit = acc.credit.add(line.credit);
      return acc;
    }, { debit: new Prisma.Decimal(0), credit: new Prisma.Decimal(0) });
  }

  async seedDefaultAccounts(organizationId: string, schoolId: string, actorId: string) {
    const defaults = [
      { code: '1000', name: 'ASSETS', type: AccountType.ASSET },
      { code: '1100', name: 'Cash in Hand', type: AccountType.ASSET, parentCode: '1000', isSystem: true },
      { code: '1200', name: 'Bank Accounts', type: AccountType.ASSET, parentCode: '1000', isSystem: true },
      { code: '1300', name: 'Accounts Receivable', type: AccountType.ASSET, parentCode: '1000', isSystem: true },

      { code: '2000', name: 'LIABILITIES', type: AccountType.LIABILITY },
      { code: '2100', name: 'Accounts Payable', type: AccountType.LIABILITY, parentCode: '2000', isSystem: true },

      { code: '3000', name: 'EQUITY', type: AccountType.EQUITY },
      { code: '3100', name: 'Retained Earnings', type: AccountType.EQUITY, parentCode: '3000', isSystem: true },

      { code: '4000', name: 'REVENUE', type: AccountType.REVENUE },
      { code: '4100', name: 'Tuition Fee Revenue', type: AccountType.REVENUE, parentCode: '4000', isSystem: true },
      { code: '4200', name: 'Transport Fee Revenue', type: AccountType.REVENUE, parentCode: '4000', isSystem: true },

      { code: '5000', name: 'EXPENSES', type: AccountType.EXPENSE },
      { code: '5100', name: 'Salary Expenses', type: AccountType.EXPENSE, parentCode: '5000', isSystem: true },
      { code: '5200', name: 'Utility Expenses', type: AccountType.EXPENSE, parentCode: '5000', isSystem: true },
    ];

    const createdAccounts: Map<string, string> = new Map();

    for (const d of defaults) {
      const parentId = d.parentCode ? createdAccounts.get(d.parentCode) : null;
      const acc = await this.db.chartOfAccount.upsert({
        where: { schoolId_code: { schoolId, code: d.code } },
        update: { name: d.name, type: d.type, isSystem: d.isSystem || false },
        create: {
          code: d.code,
          name: d.name,
          type: d.type,
          schoolId,
          parentAccountId: parentId,
          isSystem: d.isSystem || false,
        },
      });
      createdAccounts.set(d.code, acc.id);
    }

    return { success: true };
  }
}
