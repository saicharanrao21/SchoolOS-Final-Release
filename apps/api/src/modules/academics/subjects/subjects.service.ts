import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { Prisma } from '@prisma/client';
import { AuditService } from '../../../audit/audit.service';

@Injectable()
export class SubjectsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async create(organizationId: string, data: any, actorId?: string) {
    const school = await this.db.school.findFirst({
      where: { id: data.schoolId, organizationId },
    });
    if (!school) throw new NotFoundException('School not found');

    const subject = await this.db.subject.create({
      data: {
        name: data.name,
        code: data.code,
        type: data.type,
        category: data.category,
        school: { connect: { id: data.schoolId } },
      },
    });

    await this.audit.log({
      action: 'subject.create',
      resource: 'Subject',
      resourceId: subject.id,
      actorId,
      organizationId,
      schoolId: data.schoolId,
    });

    return subject;
  }

  async findAll(organizationId: string, schoolId: string) {
    return this.db.subject.findMany({
      where: {
        schoolId,
        school: { organizationId },
        isActive: true,
      },
    });
  }

  async assignToClass(organizationId: string, subjectId: string, classId: string, actorId?: string) {
    const subject = await this.db.subject.findFirst({
      where: { id: subjectId, school: { organizationId } },
    });
    const cls = await this.db.class.findFirst({
      where: { id: classId, school: { organizationId } },
    });
    if (!subject || !cls) throw new NotFoundException('Subject or Class not found');

    return this.db.classSubject.create({
      data: {
        classId,
        subjectId,
      },
    });
  }
}
