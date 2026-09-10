import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { AdmissionStatus } from '@prisma/client';

@Injectable()
export class DecisionsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async makeDecision(organizationId: string, data: any, actorId: string) {
    const application = await this.db.admissionApplication.findFirst({
      where: { id: data.applicationId, school: { organizationId } },
    });
    if (!application) throw new NotFoundException('Application not found');

    return this.db.$transaction(async (tx) => {
      const decision = await tx.admissionDecision.upsert({
        where: { applicationId: data.applicationId },
        update: {
          decision: data.decision,
          reason: data.reason,
          decidedById: actorId,
          notes: data.notes,
        },
        create: {
          applicationId: data.applicationId,
          decision: data.decision,
          reason: data.reason,
          decidedById: actorId,
          notes: data.notes,
        },
      });

      await tx.admissionApplication.update({
        where: { id: data.applicationId },
        data: { status: data.decision },
      });

      await this.audit.log({
        action: `admission.decision.${data.decision.toLowerCase()}`,
        resource: 'AdmissionApplication',
        resourceId: data.applicationId,
        actorId,
        organizationId,
        schoolId: application.schoolId,
        metadata: { decision: data.decision, reason: data.reason },
      });

      return decision;
    });
  }
}
