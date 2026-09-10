import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

import { OutboxService } from '../../modules/sync/outbox/outbox.service';
import { RealtimeService } from '../../modules/sync/realtime/realtime.service';
import { SyncService } from '../../modules/sync/sync/sync.service';
import { OutboxStatus, SyncMutationStatus } from '@prisma/client';

describe('Sync & Realtime Infrastructure E2E (Phase 31 - Part 12, 13 & 14)', () => {
  let db: any;
  let audit: any;
  let outboxService: OutboxService;
  let realtimeService: RealtimeService;
  let syncService: SyncService;

  beforeEach(async () => {
    db = {
      outboxEvent: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      notification: {
        findMany: jest.fn(),
      },
      studentAttendanceRecord: {
        findMany: jest.fn(),
      },
      assignment: {
        findMany: jest.fn(),
      },
      syncMutation: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(cb => cb(db)),
    };

    audit = {
      log: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutboxService,
        RealtimeService,
        SyncService,
        { provide: DatabaseService, useValue: db },
        { provide: AuditService, useValue: audit },
      ],
    }).compile();

    outboxService = module.get<OutboxService>(OutboxService);
    realtimeService = module.get<RealtimeService>(RealtimeService);
    syncService = module.get<SyncService>(SyncService);
  });

  describe('Transactional Outbox Reliability', () => {
    it('should record outbox event inside database transaction', async () => {
      db.outboxEvent.create.mockResolvedValue({ id: 'out-1', status: OutboxStatus.PENDING });

      const res = await outboxService.recordEvent(db, {
        organizationId: 'org-tenant-a',
        schoolId: 'school-a1',
        eventType: 'student.attendance.marked',
        aggregateType: 'StudentAttendanceRecord',
        aggregateId: 'att-1',
        payload: { status: 'PRESENT' },
      });

      expect(db.outboxEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          organizationId: 'org-tenant-a',
          eventType: 'student.attendance.marked',
          status: OutboxStatus.PENDING,
        }),
      });
      expect(res.id).toBe('out-1');
    });

    it('should process pending outbox events and transition status to PROCESSED', async () => {
      const mockEvents = [
        { id: 'out-1', eventType: 'student.attendance.marked', attempts: 0 },
      ];

      db.outboxEvent.findMany.mockResolvedValue(mockEvents);
      db.outboxEvent.update.mockResolvedValue({ id: 'out-1', status: OutboxStatus.PROCESSED });

      const count = await outboxService.processPendingEvents(10);

      expect(db.outboxEvent.update).toHaveBeenCalledWith({
        where: { id: 'out-1' },
        data: expect.objectContaining({ status: OutboxStatus.PROCESSED }),
      });
      expect(count).toBe(1);
    });
  });

  describe('Realtime Channel Authorization', () => {
    it('should authorize client subscription to own organization channel', async () => {
      const isAuthorized = await realtimeService.authorizeChannelSubscription('usr-admin-a', 'org-tenant-a', 'org:org-tenant-a');
      expect(isAuthorized).toBe(true);
    });

    it('should reject client subscription to another organization channel (ForbiddenException)', async () => {
      await expect(
        realtimeService.authorizeChannelSubscription('usr-admin-a', 'org-tenant-a', 'org:org-tenant-b')
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Offline Client Mutation Replay & Idempotency', () => {
    it('should return cached response for duplicate clientMutationId without re-processing', async () => {
      const existingMutation = {
        clientMutationId: 'mut-unique-001',
        status: SyncMutationStatus.COMPLETED,
        response: { markedCount: 25 },
      };

      db.syncMutation.findUnique.mockResolvedValue(existingMutation);

      const res = await syncService.processClientMutation('org-tenant-a', 'usr-teacher-a', {
        clientMutationId: 'mut-unique-001',
        entityType: 'Attendance',
        action: 'MARK_BULK',
        payload: { records: [{ studentId: 's1' }] },
      });

      expect(res).toEqual({ success: true, idempotent: true, response: { markedCount: 25 } });
    });
  });
});
