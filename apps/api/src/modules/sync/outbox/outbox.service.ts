import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { OutboxStatus, Prisma } from '@prisma/client';

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);

  constructor(private readonly db: DatabaseService) {}

  async recordEvent(
    tx: Prisma.TransactionClient,
    params: {
      organizationId: string;
      schoolId?: string;
      eventType: string;
      aggregateType: string;
      aggregateId: string;
      payload: any;
    },
  ) {
    return tx.outboxEvent.create({
      data: {
        organizationId: params.organizationId,
        schoolId: params.schoolId,
        eventType: params.eventType,
        aggregateType: params.aggregateType,
        aggregateId: params.aggregateId,
        payload: params.payload,
        status: OutboxStatus.PENDING,
        attempts: 0,
        availableAt: new Date(),
      },
    });
  }

  async processPendingEvents(batchSize: number = 50) {
    const events = await this.db.outboxEvent.findMany({
      where: {
        status: OutboxStatus.PENDING,
        availableAt: { lte: new Date() },
      },
      take: batchSize,
      orderBy: { createdAt: 'asc' },
    });

    for (const event of events) {
      try {
        await this.db.outboxEvent.update({
          where: { id: event.id },
          data: {
            status: OutboxStatus.PROCESSED,
            processedAt: new Date(),
          },
        });
        this.logger.log(`Outbox event ${event.id} (${event.eventType}) processed successfully`);
      } catch (error) {
        this.logger.error(`Outbox event ${event.id} processing failed: ${error.message}`);
        await this.db.outboxEvent.update({
          where: { id: event.id },
          data: {
            status: event.attempts >= 3 ? OutboxStatus.FAILED : OutboxStatus.PENDING,
            attempts: { increment: 1 },
            lastError: error.message,
            availableAt: new Date(Date.now() + Math.pow(2, event.attempts) * 1000), // Exponential backoff
          },
        });
      }
    }

    return events.length;
  }
}
