import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { NotFoundException } from '@nestjs/common';
import { SaaSSubscriptionsService } from './subscriptions.service';
import { SubscriptionStatus, SaaSInvoiceStatus } from '@prisma/client';

jest.mock('@nestjs/event-emitter', () => ({
  EventEmitter2: jest.fn().mockImplementation(() => ({
    emit: jest.fn(),
  })),
  OnEvent: jest.fn().mockImplementation(() => jest.fn()),
}));

import { EventEmitter2 } from '@nestjs/event-emitter';

describe('SaaSSubscriptionsService', () => {
  let service: SaaSSubscriptionsService;
  let db: any;
  let audit: any;
  let eventEmitter: any;

  beforeEach(async () => {
    db = {
      saaSSubscription: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
      saaSPlan: {
        findUnique: jest.fn(),
      },
      saaSInvoice: {
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
      },
      $transaction: jest.fn(cb => cb(db)),
    };

    audit = {
      log: jest.fn().mockResolvedValue(true),
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaaSSubscriptionsService,
        { provide: DatabaseService, useValue: db },
        { provide: AuditService, useValue: audit },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<SaaSSubscriptionsService>(SaaSSubscriptionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSubscription', () => {
    it('should throw NotFoundException if subscription does not exist', async () => {
      db.saaSSubscription.findUnique.mockResolvedValue(null);

      await expect(
        service.getSubscription('org-99')
      ).rejects.toThrow(NotFoundException);
    });

    it('should return subscription details', async () => {
      const mockSub = {
        id: 'sub-1',
        organizationId: 'org-1',
        status: SubscriptionStatus.ACTIVE,
      };

      db.saaSSubscription.findUnique.mockResolvedValue(mockSub);

      const res = await service.getSubscription('org-1');
      expect(res).toEqual(mockSub);
    });
  });

  describe('startTrial', () => {
    it('should start a trialing subscription', async () => {
      const mockPlan = {
        id: 'plan-1',
        code: 'PRO',
        trialDays: 14,
      };

      const mockSub = {
        id: 'sub-1',
        organizationId: 'org-1',
        status: SubscriptionStatus.TRIALING,
      };

      db.saaSPlan.findUnique.mockResolvedValue(mockPlan);
      db.saaSSubscription.upsert.mockResolvedValue(mockSub);

      const res = await service.startTrial('org-1', 'PRO', 'actor-1');

      expect(db.saaSPlan.findUnique).toHaveBeenCalledWith({ where: { code: 'PRO' } });
      expect(db.saaSSubscription.upsert).toHaveBeenCalled();
      expect(res).toEqual(mockSub);
    });
  });

  describe('subscribe', () => {
    it('should create subscription and invoice inside transaction', async () => {
      const mockPlan = {
        id: 'plan-1',
        code: 'ENTERPRISE',
        name: 'Enterprise Plan',
        monthlyPrice: 299.00,
        yearlyPrice: 2990.00,
        currency: 'USD',
      };

      const mockSub = {
        id: 'sub-1',
        organizationId: 'org-1',
        status: SubscriptionStatus.ACTIVE,
      };

      const mockInvoice = {
        id: 'inv-1',
        invoiceNumber: 'INV-SAAS-2026-000001',
        status: SaaSInvoiceStatus.OPEN,
      };

      db.saaSPlan.findUnique.mockResolvedValue(mockPlan);
      db.saaSSubscription.upsert.mockResolvedValue(mockSub);
      db.saaSInvoice.create.mockResolvedValue(mockInvoice);

      const res = await service.subscribe('org-1', 'ENTERPRISE', 'MONTHLY', 'actor-1');

      expect(db.saaSInvoice.create).toHaveBeenCalled();
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'billing.subscription.subscribe',
        })
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith('billing.subscription.created', expect.any(Object));
      expect(res).toEqual({ subscription: mockSub, invoice: mockInvoice });
    });
  });
});
