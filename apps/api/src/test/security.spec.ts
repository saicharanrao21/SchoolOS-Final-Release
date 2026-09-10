import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../database/database.service';
import { AuditService } from '../audit/audit.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

jest.mock('@nestjs/event-emitter', () => ({
  EventEmitter2: jest.fn().mockImplementation(() => ({
    emit: jest.fn(),
  })),
  OnEvent: jest.fn().mockImplementation(() => jest.fn()),
}));

import { ParentService } from '../modules/parent/parent.service';
import { TeacherService } from '../modules/teacher/teacher.service';
import { SaaSSubscriptionsService } from '../modules/billing/subscriptions/subscriptions.service';
import { SaaSWebhooksService } from '../modules/billing/webhooks/webhooks.service';
import { RealtimeService } from '../modules/sync/realtime/realtime.service';
import { SyncService } from '../modules/sync/sync/sync.service';
import { OutboxService } from '../modules/sync/outbox/outbox.service';
import { PlatformTenantsService } from '../modules/platform/tenants/tenants.service';
import { DmsService } from '../modules/dms/dms.service';
import { SubscriptionStatus, SaaSInvoiceStatus, SaaSPaymentProvider, SyncMutationStatus } from '@prisma/client';

describe('Enterprise Security Hardening Test Suite (Phase 30)', () => {
  let db: any;
  let audit: any;
  let eventEmitter: any;
  let parentService: ParentService;
  let teacherService: TeacherService;
  let billingService: SaaSSubscriptionsService;
  let webhooksService: SaaSWebhooksService;
  let realtimeService: RealtimeService;
  let syncService: SyncService;
  let outboxService: OutboxService;
  let platformTenantsService: PlatformTenantsService;
  let dmsService: DmsService;
  let permissionsGuard: PermissionsGuard;

  beforeEach(async () => {
    db = {
      guardianStudent: {
        findFirst: jest.fn(),
      },
      student: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      teacherSubjectAssignment: {
        findFirst: jest.fn(),
      },
      saaSSubscription: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      saaSInvoice: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      saaSPayment: {
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
      },
      saaSWebhookEvent: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      syncMutation: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
      dmsDocument: {
        findMany: jest.fn(),
      },
      organization: {
        findUnique: jest.fn(),
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
        ParentService,
        TeacherService,
        SaaSSubscriptionsService,
        SaaSWebhooksService,
        RealtimeService,
        SyncService,
        OutboxService,
        PlatformTenantsService,
        DmsService,
        PermissionsGuard,
        Reflector,
        { provide: DatabaseService, useValue: db },
        { provide: AuditService, useValue: audit },
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: SaaSSubscriptionsService, useValue: { getSubscription: jest.fn() } },
      ],
    }).compile();

    parentService = module.get<ParentService>(ParentService);
    teacherService = module.get<TeacherService>(TeacherService);
    billingService = module.get<SaaSSubscriptionsService>(SaaSSubscriptionsService);
    webhooksService = module.get<SaaSWebhooksService>(SaaSWebhooksService);
    realtimeService = module.get<RealtimeService>(RealtimeService);
    syncService = module.get<SyncService>(SyncService);
    outboxService = module.get<OutboxService>(OutboxService);
    platformTenantsService = module.get<PlatformTenantsService>(PlatformTenantsService);
    dmsService = module.get<DmsService>(DmsService);
    permissionsGuard = module.get<PermissionsGuard>(PermissionsGuard);
  });

  // 1. Parent-Child Authorization & IDOR Rejection
  describe('Parent-Child Security (IDOR Rejection)', () => {
    it('should reject parent access to unlinked student data (ForbiddenException)', async () => {
      db.guardianStudent.findFirst.mockResolvedValue(null);

      await expect(
        parentService.verifyRelationship('parent-user-1', 'unlinked-student-99')
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow parent access when guardian-student relation exists', async () => {
      db.guardianStudent.findFirst.mockResolvedValue({ id: 'rel-1' });

      const rel = await parentService.verifyRelationship('parent-user-1', 'child-student-1');
      expect(rel).toEqual({ id: 'rel-1' });
    });
  });

  // 2. Teacher Class Assignment Scope Security
  describe('Teacher Class Assignment Security', () => {
    it('should reject teacher access to unassigned class/subject', async () => {
      db.teacherSubjectAssignment.findFirst.mockResolvedValue(null);

      await expect(
        teacherService.verifyAssignment('teacher-user-1', 'class-99', 'section-99')
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // 3. Realtime Channel Tenant Authorization
  describe('Realtime Channel Authorization', () => {
    it('should reject client subscribing to another organization realtime channel', async () => {
      await expect(
        realtimeService.authorizeChannelSubscription('user-1', 'tenant-A', 'org:tenant-B')
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject client subscribing to another user private channel', async () => {
      await expect(
        realtimeService.authorizeChannelSubscription('user-1', 'tenant-A', 'user:user-2')
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // 4. Offline Mutation Replay & Idempotency
  describe('Offline Mutation Idempotency & Replay', () => {
    it('should return cached response for duplicate client mutation replay without re-execution', async () => {
      const existing = {
        clientMutationId: 'mut-123',
        status: SyncMutationStatus.COMPLETED,
        response: { status: 'SUCCESS' },
      };

      db.syncMutation.findUnique.mockResolvedValue(existing);

      const result = await syncService.processClientMutation('tenant-A', 'user-1', {
        clientMutationId: 'mut-123',
        entityType: 'Attendance',
        action: 'MARK_BULK',
        payload: {},
      });

      expect(result).toEqual({ success: true, idempotent: true, response: { status: 'SUCCESS' } });
    });
  });

  // 5. SaaS Webhook Idempotency & Signature
  describe('Webhook Security & Idempotency', () => {
    it('should handle webhook events idempotently if already processed', async () => {
      db.saaSWebhookEvent.findUnique.mockResolvedValue({
        provider: SaaSPaymentProvider.RAZORPAY,
        eventId: 'evt_123',
        processed: true,
      });

      const result = await webhooksService.processWebhook(
        SaaSPaymentProvider.RAZORPAY,
        { id: 'evt_123', event: 'payment.captured' }
      );

      expect(result).toEqual({ success: true, idempotent: true });
    });
  });

  // 6. RBAC Guard Enforcement
  describe('RBAC Permissions Guard', () => {
    it('should allow SUPER_ADMIN role bypass', () => {
      const context: any = {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({ user: { roles: ['SUPER_ADMIN'], permissions: [] } }),
        }),
      };

      const reflector: any = { getAllAndOverride: () => ['platform.tenants.manage'] };
      const guard = new PermissionsGuard(reflector);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should reject user missing required permission', () => {
      const context: any = {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({ user: { roles: ['TEACHER'], permissions: ['teacher.classes.read'] } }),
        }),
      };

      const reflector: any = { getAllAndOverride: () => ['billing.admin'] };
      const guard = new PermissionsGuard(reflector);

      expect(guard.canActivate(context)).toBe(false);
    });
  });
});
