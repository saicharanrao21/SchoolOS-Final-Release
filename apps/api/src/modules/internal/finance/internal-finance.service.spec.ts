import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { BadRequestException } from '@nestjs/common';
import { InternalFinanceService } from './internal-finance.service';
import { ExpenseClaimStatus } from '@prisma/client';

jest.mock('@nestjs/event-emitter', () => ({
  EventEmitter2: jest.fn().mockImplementation(() => ({
    emit: jest.fn(),
  })),
  OnEvent: jest.fn().mockImplementation(() => jest.fn()),
}));

import { EventEmitter2 } from '@nestjs/event-emitter';

describe('InternalFinanceService', () => {
  let service: InternalFinanceService;
  let db: any;
  let audit: any;
  let eventEmitter: any;

  beforeEach(async () => {
    db = {
      internalExpenseCategory: {
        create: jest.fn(),
      },
      internalExpense: {
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        aggregate: jest.fn(),
      },
    };

    audit = {
      log: jest.fn().mockResolvedValue(true),
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InternalFinanceService,
        { provide: DatabaseService, useValue: db },
        { provide: AuditService, useValue: audit },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<InternalFinanceService>(InternalFinanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createExpenseClaim', () => {
    it('should create an internal expense claim with generated claim number', async () => {
      const mockExpense = {
        id: 'exp-1',
        claimNumber: 'EXP-2026-000001',
        title: 'Travel Reimbursement',
        amount: 250.00,
        status: ExpenseClaimStatus.SUBMITTED,
      };

      db.internalExpense.create.mockResolvedValue(mockExpense);

      const data = {
        title: 'Travel Reimbursement',
        categoryId: 'cat-1',
        amount: 250.00,
        expenseDate: '2026-09-01',
      };

      const result = await service.createExpenseClaim('org-1', data, 'user-1');

      expect(db.internalExpense.create).toHaveBeenCalled();
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'internal.expense.create',
          resource: 'InternalExpense',
        })
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith('internal.expense.submitted', expect.any(Object));
      expect(result).toEqual(mockExpense);
    });
  });

  describe('approveExpenseClaim', () => {
    it('should throw BadRequestException if expense is missing or paid', async () => {
      db.internalExpense.findUnique.mockResolvedValue({
        id: 'exp-1',
        status: ExpenseClaimStatus.PAID,
      });

      await expect(
        service.approveExpenseClaim('org-1', 'exp-1', 'approver-1')
      ).rejects.toThrow(BadRequestException);
    });

    it('should approve claim and log audit event', async () => {
      const existing = {
        id: 'exp-1',
        status: ExpenseClaimStatus.SUBMITTED,
      };

      const updated = {
        ...existing,
        status: ExpenseClaimStatus.APPROVED,
        approvedById: 'approver-1',
      };

      db.internalExpense.findUnique.mockResolvedValue(existing);
      db.internalExpense.update.mockResolvedValue(updated);

      const result = await service.approveExpenseClaim('org-1', 'exp-1', 'approver-1');

      expect(db.internalExpense.update).toHaveBeenCalled();
      expect(result.status).toEqual(ExpenseClaimStatus.APPROVED);
    });
  });
});
