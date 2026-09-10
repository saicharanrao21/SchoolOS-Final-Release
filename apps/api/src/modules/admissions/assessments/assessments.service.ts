import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';

@Injectable()
export class AssessmentsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async create(organizationId: string, data: any, actorId: string) {
    const application = await this.db.admissionApplication.findFirst({
      where: { id: data.applicationId, school: { organizationId } },
    });
    if (!application) throw new NotFoundException('Application not found');

    const assessment = await this.db.admissionAssessment.create({
      data: {
        applicationId: data.applicationId,
        type: data.type,
        date: new Date(data.date),
        evaluatorId: data.evaluatorId,
        notes: data.notes,
      },
    });

    await this.audit.log({
      action: 'admission.assessment.create',
      resource: 'AdmissionAssessment',
      resourceId: assessment.id,
      actorId,
      organizationId,
      schoolId: application.schoolId,
    });

    return assessment;
  }

  async updateResult(organizationId: string, id: string, data: any, actorId: string) {
    const assessment = await this.db.admissionAssessment.findUnique({
      where: { id },
      include: { application: true },
    });
    if (!assessment) throw new NotFoundException('Assessment not found');

    const updated = await this.db.admissionAssessment.update({
      where: { id },
      data: {
        score: data.score,
        result: data.result,
        status: 'COMPLETED',
      },
    });

    await this.audit.log({
      action: 'admission.assessment.update_result',
      resource: 'AdmissionAssessment',
      resourceId: id,
      actorId,
      organizationId,
      schoolId: assessment.application.schoolId,
    });

    return updated;
  }
}
