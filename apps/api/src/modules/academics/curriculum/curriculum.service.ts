import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CurriculumService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async create(organizationId: string, data: any, actorId: string) {
    const school = await this.db.school.findFirst({
      where: { id: data.schoolId, organizationId },
    });
    if (!school) throw new NotFoundException('School not found');

    const curriculum = await this.db.curriculum.create({
      data: {
        title: data.title,
        description: data.description,
        academicYearId: data.academicYearId,
        classId: data.classId,
        subjectId: data.subjectId,
        schoolId: data.schoolId,
        units: {
          create: data.units?.map((u: any) => ({
            title: u.title,
            description: u.description,
            learningObjectives: u.learningObjectives,
            sequence: u.sequence,
          })),
        },
      },
      include: { units: true },
    });

    await this.audit.log({
      action: 'academics.curriculum.create',
      resource: 'Curriculum',
      resourceId: curriculum.id,
      actorId,
      organizationId,
      schoolId: data.schoolId,
    });

    return curriculum;
  }

  async findAll(organizationId: string, filters: any) {
    return this.db.curriculum.findMany({
      where: {
        school: { organizationId },
        schoolId: filters.schoolId,
        academicYearId: filters.academicYearId,
        classId: filters.classId,
        subjectId: filters.subjectId,
      },
      include: {
        units: { orderBy: { sequence: 'asc' } },
        class: true,
        subject: true,
      },
    });
  }

  async findOne(organizationId: string, id: string) {
    const curriculum = await this.db.curriculum.findFirst({
      where: { id, school: { organizationId } },
      include: {
        units: { orderBy: { sequence: 'asc' } },
        class: true,
        subject: true,
      },
    });
    if (!curriculum) throw new NotFoundException('Curriculum not found');
    return curriculum;
  }
}
