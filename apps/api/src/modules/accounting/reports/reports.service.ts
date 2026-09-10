import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { Prisma, AccountType } from '@prisma/client';

@Injectable()
export class AccountingReportsService {
  constructor(private readonly db: DatabaseService) {}

  async getTrialBalance(organizationId: string, schoolId: string, fiscalYearId: string) {
    const accounts = await this.db.chartOfAccount.findMany({
      where: { schoolId, school: { organizationId } },
      include: {
        journalLines: {
          where: { journalEntry: { fiscalYearId, status: 'POSTED' } },
          select: { debit: true, credit: true },
        },
      },
    });

    const report = accounts.map((acc: any) => {
      const totals = acc.journalLines.reduce((sum: { debit: Prisma.Decimal, credit: Prisma.Decimal }, line: { debit: Prisma.Decimal, credit: Prisma.Decimal }) => {
        sum.debit = sum.debit.add(line.debit);
        sum.credit = sum.credit.add(line.credit);
        return sum;
      }, { debit: new Prisma.Decimal(0), credit: new Prisma.Decimal(0) });

      return {
        id: acc.id,
        code: acc.code,
        name: acc.name,
        type: acc.type,
        debit: totals.debit,
        credit: totals.credit,
        balance: totals.debit.sub(totals.credit),
      };
    }).filter((a: any) => !a.debit.isZero() || !a.credit.isZero());

    return report;
  }

  async getProfitAndLoss(organizationId: string, schoolId: string, fiscalYearId: string) {
    const report = await this.getTrialBalance(organizationId, schoolId, fiscalYearId);

    const revenue = report.filter((r: any) => r.type === AccountType.REVENUE);
    const expenses = report.filter((r: any) => r.type === AccountType.EXPENSE);

    const totalRevenue = revenue.reduce((sum: Prisma.Decimal, r: any) => sum.add(r.credit.sub(r.debit)), new Prisma.Decimal(0));
    const totalExpenses = expenses.reduce((sum: Prisma.Decimal, r: any) => sum.add(r.debit.sub(r.credit)), new Prisma.Decimal(0));
    const netProfit = totalRevenue.sub(totalExpenses);

    return {
      revenue,
      expenses,
      totalRevenue,
      totalExpenses,
      netProfit,
    };
  }

  async getBalanceSheet(organizationId: string, schoolId: string, fiscalYearId: string) {
    const report = await this.getTrialBalance(organizationId, schoolId, fiscalYearId);

    const assets = report.filter((r: any) => r.type === AccountType.ASSET);
    const liabilities = report.filter((r: any) => r.type === AccountType.LIABILITY);
    const equity = report.filter((r: any) => r.type === AccountType.EQUITY);

    const totalAssets = assets.reduce((sum: Prisma.Decimal, r: any) => sum.add(r.debit.sub(r.credit)), new Prisma.Decimal(0));
    const totalLiabilities = liabilities.reduce((sum: Prisma.Decimal, r: any) => sum.add(r.credit.sub(r.debit)), new Prisma.Decimal(0));
    const totalEquity = equity.reduce((sum: Prisma.Decimal, r: any) => sum.add(r.credit.sub(r.debit)), new Prisma.Decimal(0));

    // Calculate P&L for current year to add to equity
    const pl = await this.getProfitAndLoss(organizationId, schoolId, fiscalYearId);
    const currentYearEarnings = pl.netProfit;

    return {
      assets,
      liabilities,
      equity,
      currentYearEarnings,
      totalAssets,
      totalLiabilities,
      totalEquity: totalEquity.add(currentYearEarnings),
    };
  }
}
