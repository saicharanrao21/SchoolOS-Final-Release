import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ExamsConfigService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async createType(organizationId: string, data: any, actorId: string) {
    const type = await this.db.examType.create({
      data: {
        name: data.name,
        description: data.description,
        schoolId: data.schoolId,
      },
    });

    await this.audit.log({
      action: 'exams.type.create',
      resource: 'ExamType',
      resourceId: type.id,
      actorId,
      organizationId,
      schoolId: data.schoolId,
    });

    return type;
  }

  async findAllTypes(organizationId: string, schoolId: string) {
    return this.db.examType.findMany({
      where: { schoolId, school: { organizationId } },
      orderBy: { name: 'asc' },
    });
  }

  async createComponent(organizationId: string, data: any, actorId: string) {
    const component = await this.db.assessmentComponent.create({
      data: {
        name: data.name,
        maxMarks: data.maxMarks,
        passMarks: data.passMarks,
        weightage: data.weightage,
        schoolId: data.schoolId,
      },
    });

    await this.audit.log({
      action: 'exams.component.create',
      resource: 'AssessmentComponent',
      resourceId: component.id,
      actorId,
      organizationId,
      schoolId: data.schoolId,
    });

    return component;
  }

  async findAllComponents(organizationId: string, schoolId: string) {
    return this.db.assessmentComponent.findMany({
      where: { schoolId, school: { organizationId } },
      orderBy: { name: 'asc' },
    });
  }
}
