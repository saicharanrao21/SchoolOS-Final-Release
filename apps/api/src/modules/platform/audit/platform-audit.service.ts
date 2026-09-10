import { Injectable } from '@nestjs/common';
import { AuditSeverity } from '@prisma/client';
import { DatabaseService } from '../../../database/database.service';

@Injectable()
export class PlatformAuditService {
  constructor(private readonly db: DatabaseService) {}

  async search(organizationId: string, query: {
    schoolId?: string;
    action?: string;
    resource?: string;
    severity?: AuditSeverity;
    actorId?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = Math.max(1, Number(query.page || 1));
    const pageSize = Math.min(100, Math.max(10, Number(query.pageSize || 25)));
    const where: any = { organizationId };
    if (query.schoolId) where.schoolId = query.schoolId;
    if (query.action) where.action = { contains: query.action, mode: 'insensitive' };
    if (query.resource) where.resource = { contains: query.resource, mode: 'insensitive' };
    if (query.actorId) where.actorId = query.actorId;
    if (query.severity) where.severity = query.severity;
    if (query.from || query.to) where.createdAt = {
      ...(query.from ? { gte: new Date(query.from) } : {}),
      ...(query.to ? { lte: new Date(query.to) } : {}),
    };

    const [items, total] = await this.db.$transaction([
      this.db.auditEvent.findMany({
        where,
        include: {
          actor: { select: { id: true, firstName: true, lastName: true, email: true } },
          school: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.db.auditEvent.count({ where }),
    ]);

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async summary(organizationId: string) {
    const [total, critical, high, today] = await Promise.all([
      this.db.auditEvent.count({ where: { organizationId } }),
      this.db.auditEvent.count({ where: { organizationId, severity: AuditSeverity.CRITICAL } }),
      this.db.auditEvent.count({ where: { organizationId, severity: AuditSeverity.HIGH } }),
      this.db.auditEvent.count({ where: { organizationId, createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
    ]);
    return { total, critical, high, today };
  }
}
