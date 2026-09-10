import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { SaaSWebhooksService } from '../../modules/billing/webhooks/webhooks.service';
import { OutboxService } from '../../modules/sync/outbox/outbox.service';
import { SaaSPaymentProvider, SaaSPaymentStatus, SaaSInvoiceStatus, OutboxStatus, Prisma } from '@prisma/client';

describe('Concurrency, Failure & Recovery E2E (Phase 31 - Part 15 & 18)', () => {
  let db: any;
  let eventEmitter: any;
   subterraneanService: SaaSWebhooksService;
  let webhooksService: SaaSWebhooksService;
  let outboxService: OutboxService;

  beforeEach(async () => {
    db = {
      saaSWebhookEvent: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
      saaSInvoice: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      saaSSubscription: {
        update: jest.fn(),
      },
      saaSPayment: {
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
      },
      outboxEvent: {
        findMany: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(cb => cb(db)),
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaaSWebhooksService,
        OutboxService,
        { provide: DatabaseService, useValue: db },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    webhooksService = module.get<SaaSWebhooksService>(SaaSWebhooksService);
    outboxService = module.get<OutboxService>(OutboxService);
  });

  describe('Concurrent Webhook Callbacks & Duplicate Prevention', () => {
    it('should safely serialize duplicate simultaneous webhook callbacks via idempotency lock', async () => {
      // First webhook lookup finds null (new)
      db.saaSWebhookEvent.findUnique.mockResolvedValueOnce(null);

      // Second webhook lookup finds existing processed event
      db.saaSWebhookEvent.findUnique.mockResolvedValueOnce({
        provider: SaaSPaymentProvider.RAZORPAY,
        eventId: 'evt_dup_001',
        processed: true,
      });

      db.saaSInvoice.findUnique.mockResolvedValue({
        id: 'inv-1',
        organizationId: 'org-tenant-a',
        totalAmount: new Prisma.Decimal(299.00),
        currency: 'USD',
      });

      const payload = {
        id: 'evt_dup_001',
        event: 'payment.captured',
        notes: { invoiceId: 'inv-1', organizationId: 'org-tenant-a' },
      };

      // Concurrent invocation
      const [res1, res2] = await Promise.all([
        webhooksService.processWebhook(SaaSPaymentProvider.RAZORPAY, payload),
        webhooksService.processWebhook(SaaSPaymentProvider.RAZORPAY, payload),
      ]);

      expect(res1.success).toBe(true);
      expect((res2 as any).idempotent).toBe(true);
    });
  });

  describe('Outbox Exponential Backoff Retry Recovery', () => {
    it('should increment attempt count and set exponential backoff availableAt on failure', async () => {
      const mockEvent = {
        id: 'out-fail-1',
        eventType: 'student.attendance.marked',
        attempts: 1,
      };

      db.outboxEvent.findMany.mockResolvedValue([mockEvent]);
      db.outboxEvent.update.mockRejectedValueOnce(new Error('Database lock timeout'))
        .mockResolvedValueOnce({ id: 'out-fail-1', attempts: 2 });

      await outboxService.processPendingEvents(1);

      expect(db.outboxEvent.update).toHaveBeenCalledWith({
        where: { id: 'out-fail-1' },
        data: expect.objectContaining({
          attempts: { increment: 1 },
          lastError: 'Database lock timeout',
        }),
      });
    });
  });
});
