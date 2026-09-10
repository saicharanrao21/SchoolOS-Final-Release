import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { AccountingIntegrationService } from '../../accounting/accounting-integration.service';
import { Prisma, PaymentMethod, PaymentStatus, InvoiceStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
    private readonly accounting: AccountingIntegrationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async collect(organizationId: string, data: any, actorId: string) {
    const student = await this.db.student.findFirst({
      where: { id: data.studentId, school: { organizationId } },
    });
    if (!student) throw new NotFoundException('Student not found');

    const demand = await this.db.feeDemand.findFirst({
      where: { id: data.feeDemandId, studentId: student.id, student: { school: { organizationId } } },
    });
    if (!demand) throw new NotFoundException('Fee demand not found');

    const amount = new Prisma.Decimal(data.amount);
    if (amount.gt(demand.balanceAmount)) {
      throw new BadRequestException('Payment amount exceeds invoice balance');
    }

    return this.db.$transaction(async (tx) => {
      // ... (previous logic)
      const payment = await tx.payment.create({
        data: {
          studentId: student.id,
          feeDemandId: demand.id,
          amount,
          method: data.method,
          transactionRef: data.transactionRef,
          providerRef: data.providerRef,
          receivedById: actorId,
          status: PaymentStatus.SUCCESS,
          paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
        },
      });

      // ... (receipt, demand, account, ledger logic)
      const receiptNumber = await this.generateReceiptNumber(tx, student.schoolId);
      await tx.receipt.create({
        data: {
          receiptNumber,
          paymentId: payment.id,
        },
      });

      const newPaidAmount = demand.paidAmount.add(amount);
      const newBalanceAmount = demand.balanceAmount.sub(amount);
      let status: InvoiceStatus = InvoiceStatus.PARTIALLY_PAID;
      if (newBalanceAmount.isZero()) {
        status = InvoiceStatus.PAID;
      }

      await tx.feeDemand.update({
        where: { id: demand.id },
        data: {
          paidAmount: newPaidAmount,
          balanceAmount: newBalanceAmount,
          status,
        },
      });

      await tx.studentFeeAccount.update({
        where: { studentId: student.id },
        data: {
          totalPaid: { increment: amount },
          balance: { decrement: amount },
        },
      });

      await tx.financialLedgerEntry.create({
        data: {
          type: 'PAYMENT',
          amount,
          studentId: student.id,
          paymentId: payment.id,
          organizationId,
          schoolId: student.schoolId,
          description: `Payment received against ${demand.invoiceNumber}. Receipt: ${receiptNumber}`,
        },
      });

      await this.audit.log({
        action: 'fee.payment.collect',
        resource: 'Payment',
        resourceId: payment.id,
        actorId,
        organizationId,
        schoolId: student.schoolId,
        metadata: { amount: amount.toNumber(), method: data.method },
      });

      // Emit notification event
      this.eventEmitter.emit('payment.received', {
        organizationId,
        schoolId: student.schoolId,
        studentId: student.id,
        amount: amount.toNumber(),
        receiptNumber,
      });

      // Integrate with Accounting
      this.accounting.handlePaymentReceived(organizationId, payment.id, actorId);

      return payment;
    });
  }
private async generateReceiptNumber(tx: any, schoolId: string): Promise<string> {
    const year = new Date().getFullYear().toString();
    const count = await tx.receipt.count({
      where: { payment: { student: { schoolId } } },
    });
    return `RCP-${year}-${(count + 1).toString().padStart(6, '0')}`;
  }

  async getStudentPayments(organizationId: string, studentId: string) {
    const student = await this.db.student.findFirst({ where: { id: studentId, school: { organizationId } } });
    if (!student) throw new NotFoundException('Student not found');
    return this.db.payment.findMany({
      where: { studentId },
      include: { receipt: true, feeDemand: true },
      orderBy: { paymentDate: 'desc' },
    });
  }
}
