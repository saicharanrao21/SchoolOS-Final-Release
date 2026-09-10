import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { Prisma } from '@prisma/client';
import { AuditService } from '../../../audit/audit.service';

@Injectable()
export class SectionsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async create(organizationId: string, data: any, actorId?: string) {
    const cls = await this.db.class.findFirst({
      where: { id: data.classId, school: { organizationId } },
    });
    if (!cls) throw new NotFoundException('Class not found');

    const section = await this.db.section.create({
      data: {
        name: data.name,
        code: data.code,
        capacity: data.capacity,
        class: { connect: { id: data.classId } },
        room: data.roomId ? { connect: { id: data.roomId } } : undefined,
      },
    });

    await this.audit.log({
      action: 'section.create',
      resource: 'Section',
      resourceId: section.id,
      actorId,
      organizationId,
      schoolId: cls.schoolId,
    });

    return section;
  }

  async findAll(organizationId: string, classId: string) {
    return this.db.section.findMany({
      where: {
        classId,
        class: { school: { organizationId } },
        isActive: true,
      },
      include: { room: true },
    });
  }

  async updateClassTeacher(organizationId: string, id: string, teacherId: string, actorId?: string) {
    const section = await this.db.section.findFirst({
      where: { id, class: { school: { organizationId } } },
      include: { class: true },
    });
    if (!section) throw new NotFoundException('Section not found');

    const updated = await this.db.section.update({
      where: { id },
      data: { classTeacherId: teacherId },
    });

    await this.audit.log({
      action: 'section.assign_teacher',
      resource: 'Section',
      resourceId: id,
      actorId,
      organizationId,
      schoolId: section.class.schoolId,
      metadata: { teacherId },
    });

    return updated;
  }
}
