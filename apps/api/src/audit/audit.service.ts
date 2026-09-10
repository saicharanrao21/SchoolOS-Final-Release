import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AuditSeverity } from '@prisma/client';

export interface AuditLogOptions {
  action: string;
  resource: string;
  resourceId?: string;
  actorId?: string;
  organizationId: string;
  schoolId?: string;
  campusId?: string;
  metadata?: any;
  severity?: AuditSeverity;
  ipAddress?: string;
  userAgent?: string;
  correlationId?: string;
  studentId?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly db: DatabaseService) {}

  async log(options: AuditLogOptions) {
    return this.db.auditEvent.create({
      data: {
        action: options.action,
        resource: options.resource,
        resourceId: options.resourceId,
        actorId: options.actorId,
        organizationId: options.organizationId,
        schoolId: options.schoolId,
        campusId: options.campusId,
        metadata: options.metadata || {},
        severity: options.severity || AuditSeverity.LOW,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        correlationId: options.correlationId,
        studentId: options.studentId,
      },
    });
  }
}
