import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { Prisma } from '@prisma/client';
import { AuditService } from '../../../audit/audit.service';

@Injectable()
export class ClassesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async create(organizationId: string, data: any, actorId?: string) {
    const school = await this.db.school.findFirst({
      where: { id: data.schoolId, organizationId },
    });
    if (!school) throw new NotFoundException('School not found');

    const cls = await this.db.class.create({
      data: {
        name: data.name,
        code: data.code,
        sequence: data.sequence,
        school: { connect: { id: data.schoolId } },
        academicYear: data.academicYearId ? { connect: { id: data.academicYearId } } : undefined,
      },
    });

    await this.audit.log({
      action: 'class.create',
      resource: 'Class',
      resourceId: cls.id,
      actorId,
      organizationId,
      schoolId: data.schoolId,
    });

    return cls;
  }

  async findAll(organizationId: string, schoolId: string) {
    return this.db.class.findMany({
      where: {
        schoolId,
        school: { organizationId },
        isActive: true,
      },
      include: { sections: true },
      orderBy: { sequence: 'asc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const cls = await this.db.class.findFirst({
      where: { id, school: { organizationId } },
      include: { sections: true, subjects: { include: { subject: true } } },
    });
    if (!cls) throw new NotFoundException('Class not found');
    return cls;
  }
}
