import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { OutboxService } from '../outbox/outbox.service';
import { SyncService } from './sync.service';
import { SyncMutationStatus } from '@prisma/client';

describe('SyncService', () => {
  let service: SyncService;
  let db: any;
  let audit: any;
  let outbox: any;

  beforeEach(async () => {
    db = {
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

    outbox = {
      recordEvent: jest.fn().mockResolvedValue({ id: 'out-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncService,
        { provide: DatabaseService, useValue: db },
        { provide: AuditService, useValue: audit },
        { provide: OutboxService, useValue: outbox },
      ],
    }).compile();

    service = module.get<SyncService>(SyncService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processClientMutation', () => {
    it('should return cached response if mutation was already completed idempotently', async () => {
      const existing = {
        clientMutationId: 'mut-123',
        status: SyncMutationStatus.COMPLETED,
        response: { status: 'SUCCESS' },
      };

      db.syncMutation.findUnique.mockResolvedValue(existing);

      const result = await service.processClientMutation('org-1', 'user-1', {
        clientMutationId: 'mut-123',
        entityType: 'Attendance',
        action: 'MARK_BULK',
        payload: {},
      });

      expect(result).toEqual({ success: true, idempotent: true, response: { status: 'SUCCESS' } });
      expect(outbox.recordEvent).not.toHaveBeenCalled();
    });

    it('should process new mutation and record outbox event in transaction', async () => {
      db.syncMutation.findUnique.mockResolvedValue(null);
      db.syncMutation.upsert.mockResolvedValue({ id: 'sync-mut-1' });
      db.syncMutation.update.mockResolvedValue({ id: 'sync-mut-1', status: SyncMutationStatus.COMPLETED });

      const data = {
        clientMutationId: 'mut-456',
        entityType: 'Attendance',
        action: 'MARK_BULK',
        payload: { records: [{ studentId: 's1' }] },
      };

      const result = await service.processClientMutation('org-1', 'user-1', data);

      expect(db.syncMutation.upsert).toHaveBeenCalled();
      expect(outbox.recordEvent).toHaveBeenCalledWith(
        db,
        expect.objectContaining({
          eventType: 'sync.mutation.attendance.mark_bulk',
        })
      );
      expect(result.success).toBe(true);
    });
  });
});
