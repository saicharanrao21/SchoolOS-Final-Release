import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { InterviewStatus } from '@prisma/client';

@Injectable()
export class InterviewsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async schedule(organizationId: string, data: any, actorId: string) {
    const application = await this.db.admissionApplication.findFirst({
      where: { id: data.applicationId, school: { organizationId } },
    });
    if (!application) throw new NotFoundException('Application not found');

    const interview = await this.db.admissionInterview.create({
      data: {
        applicationId: data.applicationId,
        interviewerId: data.interviewerId,
        date: new Date(data.date),
        location: data.location,
        status: InterviewStatus.SCHEDULED,
      },
    });

    await this.audit.log({
      action: 'admission.interview.schedule',
      resource: 'AdmissionInterview',
      resourceId: interview.id,
      actorId,
      organizationId,
      schoolId: application.schoolId,
    });

    return interview;
  }

  async updateStatus(organizationId: string, id: string, status: InterviewStatus, actorId: string, outcome?: string) {
    const interview = await this.db.admissionInterview.findUnique({
      where: { id },
      include: { application: true },
    });
    if (!interview) throw new NotFoundException('Interview not found');

    const updated = await this.db.admissionInterview.update({
      where: { id },
      data: { status, outcome },
    });

    await this.audit.log({
      action: `admission.interview.status.${status.toLowerCase()}`,
      resource: 'AdmissionInterview',
      resourceId: id,
      actorId,
      organizationId,
      schoolId: interview.application.schoolId,
    });

    return updated;
  }
}
