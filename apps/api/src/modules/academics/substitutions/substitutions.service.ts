import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SubstitutionsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async create(organizationId: string, data: any, actorId: string) {
    const substitution = await this.db.substitution.create({
      data: {
        date: new Date(data.date),
        periodId: data.periodId,
        originalEmployeeId: data.originalEmployeeId,
        substituteEmployeeId: data.substituteEmployeeId,
        subjectId: data.subjectId,
        classId: data.classId,
        sectionId: data.sectionId,
        reason: data.reason,
        authorizedById: actorId,
      },
    });

    await this.audit.log({
      action: 'academics.substitution.create',
      resource: 'Substitution',
      resourceId: substitution.id,
      actorId,
      organizationId,
    });

    return substitution;
  }

  async findAll(organizationId: string, filters: any) {
    return this.db.substitution.findMany({
      where: {
        class: { school: { organizationId } },
        date: filters.date ? new Date(filters.date) : undefined,
        classId: filters.classId,
        sectionId: filters.sectionId,
      },
      include: {
        originalEmployee: true,
        substituteEmployee: true,
        period: true,
        subject: true,
        class: true,
        section: true,
      },
      orderBy: { date: 'desc' },
    });
  }
}
