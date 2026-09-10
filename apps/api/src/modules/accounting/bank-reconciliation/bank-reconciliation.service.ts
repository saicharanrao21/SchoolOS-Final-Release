import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { BankStatementStatus, BankTransactionStatus, Prisma } from '@prisma/client';

@Injectable()
export class BankReconciliationService {
  constructor(private readonly db: DatabaseService, private readonly audit: AuditService) {}

  private async assertSchool(org: string, schoolId: string) {
    const school = await this.db.school.findFirst({ where: { id: schoolId, organizationId: org }, select: { id: true } });
    if (!school) throw new ForbiddenException('School is outside the authenticated organization');
    return school;
  }

  async importStatement(org: string, data: any, actorId: string) {
    await this.assertSchool(org, data.schoolId);
    const bank = await this.db.bankAccount.findFirst({ where: { id: data.bankAccountId, schoolId: data.schoolId, isActive: true } });
    if (!bank) throw new NotFoundException('Bank account not found for this school');
    if (!data.statementNumber?.trim()) throw new BadRequestException('Statement number is required');
    if (!Array.isArray(data.transactions) || !data.transactions.length) throw new BadRequestException('Statement requires transactions');
    const existing = await this.db.bankStatement.findFirst({ where: { schoolId: data.schoolId, statementNumber: data.statementNumber.trim() } });
    if (existing) throw new BadRequestException('Statement number already imported');

    const statement = await this.db.bankStatement.create({
      data: {
        bankAccountId: bank.id,
        organizationId: org,
        schoolId: data.schoolId,
        statementNumber: data.statementNumber.trim(),
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        openingBalance: new Prisma.Decimal(data.openingBalance ?? 0),
        closingBalance: new Prisma.Decimal(data.closingBalance ?? 0),
        notes: data.notes,
        transactions: { create: data.transactions.map((t: any) => ({ transactionDate: new Date(t.transactionDate), valueDate: t.valueDate ? new Date(t.valueDate) : undefined, reference: t.reference, description: String(t.description || '').trim(), debit: new Prisma.Decimal(t.debit ?? 0), credit: new Prisma.Decimal(t.credit ?? 0), balance: t.balance == null ? undefined : new Prisma.Decimal(t.balance) })) },
      },
      include: { transactions: true, bankAccount: true },
    });
    await this.audit.log({ action: 'accounting.bank_statement.import', resource: 'BankStatement', resourceId: statement.id, actorId, organizationId: org, schoolId: data.schoolId, metadata: { transactionCount: data.transactions.length } });
    return statement;
  }

  async listStatements(org: string, schoolId: string, status?: BankStatementStatus) {
    await this.assertSchool(org, schoolId);
    return this.db.bankStatement.findMany({ where: { organizationId: org, schoolId, ...(status ? { status } : {}) }, include: { bankAccount: true, _count: { select: { transactions: true } } }, orderBy: { periodEnd: 'desc' } });
  }

  async getStatement(org: string, id: string) {
    const statement = await this.db.bankStatement.findFirst({ where: { id, organizationId: org }, include: { bankAccount: true, transactions: { include: { reconciliations: { include: { payment: { include: { student: true, receipt: true } } } } }, orderBy: { transactionDate: 'desc' } } } });
    if (!statement) throw new NotFoundException('Bank statement not found');
    return statement;
  }

  async autoMatch(org: string, statementId: string, actorId: string) {
    const statement = await this.getStatement(org, statementId);
    if (statement.status === BankStatementStatus.CLOSED) throw new BadRequestException('Closed statements cannot be modified');
    const unmatched = statement.transactions.filter(t => t.status === BankTransactionStatus.UNMATCHED && t.credit.gt(0));
    let matched = 0;
    for (const tx of unmatched) {
      const candidates = await this.db.payment.findMany({ where: { status: 'SUCCESS', amount: tx.credit, student: { schoolId: statement.schoolId, school: { organizationId: org } }, paymentDate: { gte: new Date(tx.transactionDate.getTime() - 3 * 86400000), lte: new Date(tx.transactionDate.getTime() + 3 * 86400000) } }, include: { student: true, receipt: true, reconciliations: true }, orderBy: { paymentDate: 'desc' }, take: 5 });
      const unused = candidates.find(p => !p.reconciliations.length && (!tx.reference || p.transactionRef === tx.reference || p.providerRef === tx.reference));
      const candidate = unused || (candidates.length === 1 && !candidates[0].reconciliations.length ? candidates[0] : null);
      if (candidate) {
        await this.reconcile(org, tx.id, candidate.id, candidate.amount, actorId, 'AUTO', candidate === unused ? 98 : 75);
        matched++;
      }
    }
    return { statementId, evaluated: unmatched.length, matched };
  }

  async reconcile(org: string, transactionId: string, paymentId: string, amount: Prisma.Decimal | number | string, actorId: string, method = 'MANUAL', confidence?: number) {
    const tx = await this.db.bankStatementTransaction.findFirst({ where: { id: transactionId, organizationId: org }, include: { statement: true } });
    if (!tx) throw new NotFoundException('Bank transaction not found');
    const payment = await this.db.payment.findFirst({ where: { id: paymentId, status: 'SUCCESS', student: { schoolId: tx.schoolId, school: { organizationId: org } } } });
    if (!payment) throw new NotFoundException('Payment not found');
    const matchedAmount = new Prisma.Decimal(amount);
    if (matchedAmount.lte(0) || matchedAmount.gt(payment.amount) || matchedAmount.gt(tx.credit)) throw new BadRequestException('Matched amount exceeds available payment or bank credit');
    const already = await this.db.paymentReconciliation.findFirst({ where: { statementTransactionId: transactionId, paymentId } });
    if (already) return already;
    const totalMatched = await this.db.paymentReconciliation.aggregate({ where: { statementTransactionId: transactionId }, _sum: { matchedAmount: true } });
    const bankMatched = new Prisma.Decimal(totalMatched._sum.matchedAmount || 0).add(matchedAmount);
    if (bankMatched.gt(tx.credit)) throw new BadRequestException('Bank transaction would be over-reconciled');
    const result = await this.db.$transaction(async (db) => {
      const r = await db.paymentReconciliation.create({ data: { statementTransactionId: transactionId, paymentId, organizationId: org, schoolId: tx.schoolId, matchedAmount, matchMethod: method, confidence, matchedById: actorId } });
      await db.bankStatementTransaction.update({ where: { id: transactionId }, data: { status: bankMatched.eq(tx.credit) ? BankTransactionStatus.MATCHED : BankTransactionStatus.PARTIALLY_MATCHED, matchConfidence: confidence } });
      await db.bankStatement.update({ where: { id: tx.statementId }, data: { status: BankStatementStatus.IN_REVIEW } });
      return r;
    });
    await this.audit.log({ action: 'accounting.bank_reconciliation.match', resource: 'PaymentReconciliation', resourceId: result.id, actorId, organizationId: org, schoolId: tx.schoolId, metadata: { transactionId, paymentId, matchedAmount: matchedAmount.toNumber(), method } });
    return result;
  }

  async excludeTransaction(org: string, transactionId: string, actorId: string, reason?: string) {
    const tx = await this.db.bankStatementTransaction.findFirst({ where: { id: transactionId, organizationId: org }, include: { statement: true } });
    if (!tx) throw new NotFoundException('Bank transaction not found');
    if (tx.status === BankTransactionStatus.MATCHED) throw new BadRequestException('Matched transaction cannot be excluded');
    const updated = await this.db.bankStatementTransaction.update({ where: { id: transactionId }, data: { status: BankTransactionStatus.EXCLUDED } });
    await this.audit.log({ action: 'accounting.bank_reconciliation.exclude', resource: 'BankStatementTransaction', resourceId: transactionId, actorId, organizationId: org, schoolId: tx.schoolId, metadata: { reason } });
    return updated;
  }

  async closeStatement(org: string, id: string, actorId: string) {
    const statement = await this.getStatement(org, id);
    const open = statement.transactions.filter(t => t.status === BankTransactionStatus.UNMATCHED || t.status === BankTransactionStatus.PARTIALLY_MATCHED);
    if (open.length) throw new BadRequestException(`Cannot close statement with ${open.length} unresolved transactions`);
    const updated = await this.db.bankStatement.update({ where: { id }, data: { status: BankStatementStatus.CLOSED, reconciledAt: new Date(), reconciledById: actorId } });
    await this.audit.log({ action: 'accounting.bank_statement.close', resource: 'BankStatement', resourceId: id, actorId, organizationId: org, schoolId: statement.schoolId });
    return updated;
  }

  async summary(org: string, schoolId: string) {
    await this.assertSchool(org, schoolId);
    const [statements, transactions] = await Promise.all([
      this.db.bankStatement.findMany({ where: { organizationId: org, schoolId }, select: { status: true, closingBalance: true } }),
      this.db.bankStatementTransaction.findMany({ where: { organizationId: org, schoolId }, select: { credit: true, debit: true, status: true } }),
    ]);
    const credits = transactions.reduce((n, t) => n + Number(t.credit), 0);
    const debits = transactions.reduce((n, t) => n + Number(t.debit), 0);
    return { statementCount: statements.length, closedStatements: statements.filter(s => s.status === BankStatementStatus.CLOSED).length, unmatchedTransactions: transactions.filter(t => t.status === BankTransactionStatus.UNMATCHED).length, partialTransactions: transactions.filter(t => t.status === BankTransactionStatus.PARTIALLY_MATCHED).length, matchedTransactions: transactions.filter(t => t.status === BankTransactionStatus.MATCHED).length, excludedTransactions: transactions.filter(t => t.status === BankTransactionStatus.EXCLUDED).length, totalCredits: credits, totalDebits: debits, netMovement: credits - debits };
  }
}
