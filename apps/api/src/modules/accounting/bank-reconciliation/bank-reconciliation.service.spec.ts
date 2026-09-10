import { BankReconciliationService } from './bank-reconciliation.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const db: any = {
  school: { findFirst: jest.fn() },
  bankAccount: { findFirst: jest.fn() },
  bankStatement: { findFirst: jest.fn(), create: jest.fn(), findMany: jest.fn(), update: jest.fn() },
  bankStatementTransaction: { findFirst: jest.fn(), update: jest.fn() },
  payment: { findMany: jest.fn(), findFirst: jest.fn() },
  paymentReconciliation: { findFirst: jest.fn(), aggregate: jest.fn(), create: jest.fn() },
  $transaction: jest.fn(),
};
const audit = { log: jest.fn() } as any;

describe('BankReconciliationService', () => {
  let service: BankReconciliationService;
  beforeEach(() => { jest.clearAllMocks(); service = new BankReconciliationService(db, audit); });

  it('rejects statements for schools outside the organization', async () => {
    db.school.findFirst.mockResolvedValue(null);
    await expect(service.listStatements('org-a', 'school-b')).rejects.toBeInstanceOf(Error);
  });

  it('rejects duplicate statement numbers', async () => {
    db.school.findFirst.mockResolvedValue({ id: 'school-a' });
    db.bankAccount.findFirst.mockResolvedValue({ id: 'bank-a' });
    db.bankStatement.findFirst.mockResolvedValue({ id: 'statement-existing' });
    await expect(service.importStatement('org-a', { schoolId: 'school-a', bankAccountId: 'bank-a', statementNumber: 'ST-1', periodStart: '2026-09-01', periodEnd: '2026-09-30', transactions: [{ transactionDate: '2026-09-01', description: 'x', credit: 100 }] }, 'user-a')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('prevents over-reconciliation', async () => {
    db.bankStatementTransaction.findFirst.mockResolvedValue({ id: 'tx', organizationId: 'org-a', schoolId: 'school-a', credit: 100, statementId: 'st', statement: { status: 'IN_REVIEW' } });
    db.payment.findFirst.mockResolvedValue({ id: 'pay', amount: 100, student: { schoolId: 'school-a' } });
    db.paymentReconciliation.findFirst.mockResolvedValue(null);
    db.paymentReconciliation.aggregate.mockResolvedValue({ _sum: { matchedAmount: 50 } });
    await expect(service.reconcile('org-a', 'tx', 'pay', 60, 'user-a')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('closes only fully resolved statements', async () => {
    jest.spyOn(service, 'getStatement').mockResolvedValue({ schoolId: 'school-a', transactions: [{ status: 'UNMATCHED' }] } as any);
    await expect(service.closeStatement('org-a', 'st', 'user-a')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns a not found error for an unknown statement', async () => {
    db.bankStatement.findFirst.mockResolvedValue(null);
    await expect(service.getStatement('org-a', 'missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
