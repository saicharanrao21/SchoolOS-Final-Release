import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class StudentDocumentsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async create(studentId: string, data: any, actorId?: string) {
    const doc = await this.db.studentDocument.create({
      data: {
        name: data.name,
        type: data.type,
        fileReference: data.fileReference,
        studentId,
        uploadedById: actorId,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      },
    });

    const student = await this.db.student.findUnique({ where: { id: studentId } });

    await this.audit.log({
      action: 'student.document.upload',
      resource: 'StudentDocument',
      resourceId: doc.id,
      actorId,
      organizationId: student?.schoolId ? (await this.db.school.findUnique({ where: { id: student.schoolId } }))?.organizationId || '' : '',
      studentId,
      metadata: { docType: data.type },
    });

    return doc;
  }

  async verify(id: string, status: string, actorId?: string) {
    const doc = await this.db.studentDocument.update({
      where: { id },
      data: { verificationStatus: status },
      include: { student: true },
    });

    await this.audit.log({
      action: `student.document.verify.${status.toLowerCase()}`,
      resource: 'StudentDocument',
      resourceId: id,
      actorId,
      organizationId: (await this.db.school.findUnique({ where: { id: doc.student.schoolId } }))?.organizationId || '',
      studentId: doc.studentId,
    });

    return doc;
  }
}
