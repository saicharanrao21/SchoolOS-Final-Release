import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { LegalMatterStatus, LegalMatterPriority } from '@prisma/client';

@Injectable()
export class InternalLegalService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async createLegalMatter(organizationId: string, data: any, actorId: string) {
    const year = new Date().getFullYear();
    const count = await this.db.legalMatter.count({ where: { organizationId } });
    const caseNumber = `LEG-${year}-${(count + 1).toString().padStart(6, '0')}`;

    const matter = await this.db.legalMatter.create({
      data: {
        caseNumber,
        title: data.title,
        matterType: data.matterType || 'COMPLIANCE',
        status: LegalMatterStatus.OPEN,
        priority: (data.priority as LegalMatterPriority) || LegalMatterPriority.MEDIUM,
        description: data.description,
        externalCounsel: data.externalCounsel,
        counselContact: data.counselContact,
        nextActionDate: data.nextActionDate ? new Date(data.nextActionDate) : null,
        nextActionDescription: data.nextActionDescription,
        responsibleUserId: data.responsibleUserId || actorId,
        organizationId,
      },
    });

    await this.audit.log({
      action: 'internal.legal.create',
      resource: 'LegalMatter',
      resourceId: matter.id,
      actorId,
      organizationId,
    });

    return matter;
  }

  async getLegalMatters(organizationId: string) {
    return this.db.legalMatter.findMany({
      where: { organizationId },
      include: { responsibleUser: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
