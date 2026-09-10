import { Injectable, Logger } from '@nestjs/common';
import { JournalEntriesService } from './journal-entries/journal-entries.service';
import { DatabaseService } from '../../database/database.service';
import { AccountType, PaymentMethod } from '@prisma/client';

@Injectable()
export class AccountingIntegrationService {
  private readonly logger = new Logger(AccountingIntegrationService.name);

  constructor(
    private readonly journalEntries: JournalEntriesService,
    private readonly db: DatabaseService,
  ) {}

  async handlePaymentReceived(organizationId: string, paymentId: string, actorId: string) {
    const payment = await this.db.payment.findUnique({
      where: { id: paymentId },
      include: { student: { include: { school: true } } },
    });

    if (!payment) return;

    // Find appropriate accounts
    const schoolId = payment.student.schoolId;

    // 1. Debit Cash/Bank
    const assetAccount = await this.db.chartOfAccount.findFirst({
      where: {
        schoolId,
        code: payment.method === PaymentMethod.CASH ? '1100' : '1200'
      },
    });

    // 2. Credit Accounts Receivable
    const receivableAccount = await this.db.chartOfAccount.findFirst({
      where: { schoolId, code: '1300' },
    });

    if (!assetAccount || !receivableAccount) {
      this.logger.error(`Accounting integration failed: System accounts not found for school ${schoolId}`);
      return;
    }

    // Find a generic "Receipts" Journal
    let journal = await this.db.journal.findFirst({
      where: { schoolId, code: 'RCP' },
    });

    if (!journal) {
      journal = await this.db.journal.create({
        data: { name: 'Receipts Journal', code: 'RCP', schoolId },
      });
    }

    try {
      const entry = await this.journalEntries.create(organizationId, {
        schoolId,
        journalId: journal.id,
        date: payment.paymentDate,
        description: `Fee payment received - Student: ${payment.student.firstName} ${payment.student.lastName}`,
        sourceType: 'PAYMENT',
        sourceId: payment.id,
        lines: [
          { accountId: assetAccount.id, debit: payment.amount, credit: 0 },
          { accountId: receivableAccount.id, debit: 0, credit: payment.amount },
        ],
      }, actorId);

      // Link entry back to payment
      await this.db.payment.update({
        where: { id: paymentId },
        data: { journalEntryId: entry.id },
      });
    } catch (error) {
      this.logger.error(`Failed to post accounting entry for payment ${paymentId}: ${error.message}`);
    }
  }

  async handleFeeIssued(organizationId: string, demandId: string, actorId: string) {
     const demand = await this.db.feeDemand.findUnique({
       where: { id: demandId },
       include: { student: true },
     });

     if (!demand) return;

     const schoolId = demand.student.schoolId;

     // Debit: Accounts Receivable (1300)
     // Credit: Tuition Revenue (4100) - for simplicity using 4100 for now
     const receivableAcc = await this.db.chartOfAccount.findFirst({ where: { schoolId, code: '1300' } });
     const revenueAcc = await this.db.chartOfAccount.findFirst({ where: { schoolId, code: '4100' } });

     if (!receivableAcc || !revenueAcc) return;

     let journal = await this.db.journal.findFirst({ where: { schoolId, code: 'FE' } });
     if (!journal) journal = await this.db.journal.create({ data: { name: 'Fee Journal', code: 'FE', schoolId } });

     try {
       await this.journalEntries.create(organizationId, {
         schoolId,
         journalId: journal.id,
         date: demand.issueDate,
         description: `Fee Issued: ${demand.invoiceNumber}`,
         sourceType: 'FEE_DEMAND',
         sourceId: demand.id,
         lines: [
           { accountId: receivableAcc.id, debit: demand.totalAmount, credit: 0 },
           { accountId: revenueAcc.id, debit: 0, credit: demand.totalAmount },
         ],
       }, actorId);
     } catch (e) {
       this.logger.error(`Failed to post fee issue entry: ${e.message}`);
     }
  }

  async handlePayrollPayment(organizationId: string, data: any) {
    const { schoolId, totalNet, totalGross, periodId, actorId } = data;

    // Dr Salary Expense (5100)
    // Cr Salary Payable (2100)
    const expenseAcc = await this.db.chartOfAccount.findFirst({ where: { schoolId, code: '5100' } });
    const payableAcc = await this.db.chartOfAccount.findFirst({ where: { schoolId, code: '2100' } });

    if (!expenseAcc || !payableAcc) {
      this.logger.error('Payroll accounting accounts not found');
      return;
    }

    let journal = await this.db.journal.findFirst({ where: { schoolId, code: 'PAY' } });
    if (!journal) journal = await this.db.journal.create({ data: { name: 'Payroll Journal', code: 'PAY', schoolId } });

    try {
      await this.journalEntries.create(organizationId, {
        schoolId,
        journalId: journal.id,
        date: new Date(),
        description: `Payroll processed for period ${periodId}`,
        sourceType: 'PAYROLL',
        sourceId: periodId,
        lines: [
          { accountId: expenseAcc.id, debit: totalGross, credit: 0 },
          { accountId: payableAcc.id, debit: 0, credit: totalGross },
        ],
      }, actorId);
    } catch (e) {
      this.logger.error(`Failed to post payroll entry: ${e.message}`);
    }
  }
}
