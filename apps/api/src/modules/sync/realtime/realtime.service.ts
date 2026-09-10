import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';

export interface RealtimeEventEnvelope {
  eventId: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  organizationId: string;
  schoolId?: string;
  occurredAt: string;
  payload: any;
}

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);

  constructor(private readonly db: DatabaseService) {}

  async authorizeChannelSubscription(userId: string, organizationId: string, channelName: string): Promise<boolean> {
    // Channel format: org:{orgId}, school:{schoolId}, user:{userId}, trip:{tripId}
    const [type, id] = channelName.split(':');

    if (type === 'org' && id !== organizationId) {
      throw new ForbiddenException('Unauthorized access to organization realtime channel');
    }

    if (type === 'user' && id !== userId) {
      throw new ForbiddenException('Unauthorized access to user realtime channel');
    }

    if (type === 'school') {
      const user = await this.db.user.findUnique({
        where: { id: userId },
        include: { student: true, employee: true, guardian: { include: { students: { include: { student: true } } } } },
      });

      const userSchoolId = user?.student?.schoolId || user?.employee?.schoolId || user?.guardian?.students[0]?.student.schoolId;
      if (userSchoolId !== id) {
        throw new ForbiddenException('Unauthorized access to school realtime channel');
      }
    }

    return true;
  }

  createEnvelope(params: {
    eventId: string;
    eventType: string;
    aggregateType: string;
    aggregateId: string;
    organizationId: string;
    schoolId?: string;
    payload: any;
  }): RealtimeEventEnvelope {
    return {
      eventId: params.eventId,
      eventType: params.eventType,
      aggregateType: params.aggregateType,
      aggregateId: params.aggregateId,
      organizationId: params.organizationId,
      schoolId: params.schoolId,
      occurredAt: new Date().toISOString(),
      payload: params.payload,
    };
  }
}
