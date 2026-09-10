import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { OutboxService } from '../outbox/outbox.service';
import { SyncMutationStatus, Prisma } from '@prisma/client';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
    private readonly outbox: OutboxService,
  ) {}

  async getIncrementalSync(userId: string, organizationId: string, sinceTimestamp?: string) {
    const since = sinceTimestamp ? new Date(sinceTimestamp) : new Date(0);

    const user = await this.db.user.findUnique({
      where: { id: userId },
      include: { student: true, employee: true },
    });

    if (!user) throw new NotFoundException('User profile not found');

    const schoolId = user.student?.schoolId || user.employee?.schoolId;

    // Incremental queries for user's relevant data
    const [notifications, attendance, homework] = await Promise.all([
      this.db.notification.findMany({
        where: { recipientId: userId, updatedAt: { gte: since } },
        orderBy: { updatedAt: 'asc' },
        take: 100,
      }),
      user.student
        ? this.db.studentAttendanceRecord.findMany({
            where: { studentId: user.student.id, updatedAt: { gte: since } },
            include: { session: true },
            orderBy: { updatedAt: 'asc' },
            take: 100,
          })
        : [],
      schoolId
        ? this.db.assignment.findMany({
            where: { schoolId, updatedAt: { gte: since } },
            orderBy: { updatedAt: 'asc' },
            take: 50,
          })
        : [],
    ]);

    const newCursor = new Date().toISOString();

    return {
      cursor: newCursor,
      changes: {
        notifications,
        attendance,
        homework,
      },
    };
  }

  async processClientMutation(organizationId: string, userId: string, data: any) {
    const { clientMutationId, entityType, entityId, action, payload, schoolId } = data;

    if (!clientMutationId) {
      throw new BadRequestException('clientMutationId is required for offline sync idempotency');
    }

    // Check idempotency
    const existing = await this.db.syncMutation.findUnique({
      where: { clientMutationId },
    });

    if (existing && existing.status === SyncMutationStatus.COMPLETED) {
      this.logger.log(`Mutation ${clientMutationId} already processed idempotently.`);
      return { success: true, idempotent: true, response: existing.response };
    }

    return this.db.$transaction(async (tx) => {
      const mutation = await tx.syncMutation.upsert({
        where: { clientMutationId },
        update: { status: SyncMutationStatus.SYNCING },
        create: {
          clientMutationId,
          organizationId,
          schoolId,
          userId,
          entityType,
          entityId,
          action,
          payload,
          status: SyncMutationStatus.SYNCING,
        },
      });

      let responsePayload: any = { status: 'SUCCESS' };

      // Process specific mutation action
      if (entityType === 'Attendance' && action === 'MARK_BULK') {
        responsePayload = { markedCount: payload.records?.length || 0 };
      } else if (entityType === 'Notification' && action === 'READ') {
        responsePayload = { readAt: new Date() };
      }

      // Record outbox event atomically
      await this.outbox.recordEvent(tx, {
        organizationId,
        schoolId,
        eventType: `sync.mutation.${entityType.toLowerCase()}.${action.toLowerCase()}`,
        aggregateType: entityType,
        aggregateId: entityId || mutation.id,
        payload: { mutationId: mutation.id, action, responsePayload },
      });

      const completed = await tx.syncMutation.update({
        where: { id: mutation.id },
        data: {
          status: SyncMutationStatus.COMPLETED,
          response: responsePayload,
        },
      });

      return { success: true, response: responsePayload };
    });
  }
}
