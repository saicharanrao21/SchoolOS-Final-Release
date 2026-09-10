import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MarksEntryService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async markBulk(organizationId: string, data: any, actorId: string) {
    const { examinationId, examSubjectId, subjectId, lines } = data;

    const examSubject = await this.db.examSubject.findUnique({
      where: { id: examSubjectId },
      include: { examination: true },
    });

    if (!examSubject) throw new NotFoundException('Exam subject not found');

    return this.db.$transaction(async (tx: Prisma.TransactionClient) => {
      const markEntry = await tx.markEntry.upsert({
        where: { id: data.id || 'new-entry' }, // Simplified for bulk
        update: { status: 'DRAFT' },
        create: {
          examinationId,
          examSubjectId,
          subjectId,
          employeeId: actorId,
          status: 'DRAFT',
        },
      });

      for (const line of lines) {
        await tx.markEntryLine.upsert({
          where: {
            markEntryId_studentId_componentId: {
              markEntryId: markEntry.id,
              studentId: line.studentId,
              componentId: line.componentId || null,
            },
          },
          update: {
            marksObtained: line.marksObtained,
            isAbsent: line.isAbsent || false,
            isExempted: line.isExempted || false,
            remarks: line.remarks,
          },
          create: {
            markEntryId: markEntry.id,
            studentId: line.studentId,
            componentId: line.componentId || null,
            marksObtained: line.marksObtained,
            isAbsent: line.isAbsent || false,
            isExempted: line.isExempted || false,
            remarks: line.remarks,
          },
        });
      }

      await this.audit.log({
        action: 'exams.marks.bulk_entry',
        resource: 'MarkEntry',
        resourceId: markEntry.id,
        actorId,
        organizationId,
        schoolId: examSubject.examination.schoolId,
        metadata: { count: lines.length },
      });

      return markEntry;
    });
  }

  async submit(organizationId: string, id: string, actorId: string) {
    const markEntry = await this.db.markEntry.findUnique({
      where: { id },
      include: { examination: true },
    });

    if (!markEntry) throw new NotFoundException('Mark entry not found');

    const updated = await this.db.markEntry.update({
      where: { id },
      data: { status: 'SUBMITTED', submittedAt: new Date() },
    });

    await this.audit.log({
      action: 'exams.marks.submit',
      resource: 'MarkEntry',
      resourceId: id,
      actorId,
      organizationId,
      schoolId: markEntry.examination.schoolId,
    });

    return updated;
  }
}
