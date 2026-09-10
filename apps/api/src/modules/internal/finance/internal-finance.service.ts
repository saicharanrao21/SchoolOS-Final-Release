import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ExpenseClaimStatus, Prisma } from '@prisma/client';

@Injectable()
export class InternalFinanceService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createCategory(data: any) {
    return this.db.internalExpenseCategory.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        budgetLimit: data.budgetLimit ? new Prisma.Decimal(data.budgetLimit) : null,
      },
    });
  }

  async createExpenseClaim(organizationId: string, data: any, actorId: string) {
    const year = new Date().getFullYear();
    const count = await this.db.internalExpense.count({ where: { organizationId } });
    const claimNumber = `EXP-${year}-${(count + 1).toString().padStart(6, '0')}`;

    const expense = await this.db.internalExpense.create({
      data: {
        claimNumber,
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        amount: new Prisma.Decimal(data.amount),
        currency: data.currency || 'USD',
        taxAmount: new Prisma.Decimal(data.taxAmount || 0),
        status: data.status || ExpenseClaimStatus.SUBMITTED,
        paymentMethod: data.paymentMethod,
        expenseDate: new Date(data.expenseDate || Date.now()),
        receiptUrl: data.receiptUrl,
        department: data.department,
        organizationId,
        submittedById: actorId,
      },
    });

    await this.audit.log({
      action: 'internal.expense.create',
      resource: 'InternalExpense',
      resourceId: expense.id,
      actorId,
      organizationId,
    });

    this.eventEmitter.emit('internal.expense.submitted', {
      expenseId: expense.id,
      organizationId,
      actorId,
    });

    return expense;
  }

  async approveExpenseClaim(organizationId: string, id: string, actorId: string) {
    const expense = await this.db.internalExpense.findUnique({ where: { id } });
    if (!expense || expense.status === ExpenseClaimStatus.PAID) {
      throw new BadRequestException('Invalid expense or already paid');
    }

    const updated = await this.db.internalExpense.update({
      where: { id },
      data: {
        status: ExpenseClaimStatus.APPROVED,
        approvedById: actorId,
      },
    });

    await this.audit.log({
      action: 'internal.expense.approve',
      resource: 'InternalExpense',
      resourceId: id,
      actorId,
      organizationId,
    });

    this.eventEmitter.emit('internal.expense.approved', {
      expenseId: id,
      organizationId,
      actorId,
    });

    return updated;
  }

  async payExpenseClaim(organizationId: string, id: string, actorId: string) {
    const expense = await this.db.internalExpense.findUnique({ where: { id } });
    if (!expense || expense.status !== ExpenseClaimStatus.APPROVED) {
      throw new BadRequestException('Expense must be approved before payment');
    }

    const updated = await this.db.internalExpense.update({
      where: { id },
      data: {
        status: ExpenseClaimStatus.PAID,
        paidAt: new Date(),
      },
    });

    await this.audit.log({
      action: 'internal.expense.pay',
      resource: 'InternalExpense',
      resourceId: id,
      actorId,
      organizationId,
    });

    return updated;
  }

  async getExpenses(organizationId: string) {
    return this.db.internalExpense.findMany({
      where: { organizationId },
      include: {
        category: true,
        submittedBy: { select: { firstName: true, lastName: true, email: true } },
        approvedBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFinanceSummary(organizationId: string) {
    const [totalExpenses, approvedClaims, totalPaid] = await Promise.all([
      this.db.internalExpense.count({ where: { organizationId } }),
      this.db.internalExpense.count({ where: { organizationId, status: ExpenseClaimStatus.APPROVED } }),
      this.db.internalExpense.aggregate({
        where: { organizationId, status: ExpenseClaimStatus.PAID },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalClaims: totalExpenses,
      approvedClaims,
      totalPaidAmount: totalPaid._sum.amount || 0,
    };
  }
}
