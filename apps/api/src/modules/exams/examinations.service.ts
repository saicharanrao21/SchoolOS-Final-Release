import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';
import { Prisma, ExaminationStatus } from '@prisma/client';

@Injectable()
export class ExaminationsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async create(organizationId: string, data: any, actorId: string) {
    const examination = await this.db.examination.create({
      data: {
        name: data.name,
        academicYearId: data.academicYearId,
        termId: data.termId,
        examTypeId: data.examTypeId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        schoolId: data.schoolId,
        status: ExaminationStatus.DRAFT,
      },
    });

    await this.audit.log({
      action: 'exams.examination.create',
      resource: 'Examination',
      resourceId: examination.id,
      actorId,
      organizationId,
      schoolId: data.schoolId,
    });

    return examination;
  }

  async addSubject(organizationId: string, examId: string, data: any, actorId: string) {
    const exam = await this.db.examination.findUnique({ where: { id: examId } });
    if (!exam) throw new NotFoundException('Examination not found');

    return this.db.$transaction(async (tx: Prisma.TransactionClient) => {
      const examSubject = await tx.examSubject.create({
        data: {
          examinationId: examId,
          subjectId: data.subjectId,
          maxMarks: data.maxMarks,
          passMarks: data.passMarks,
        },
      });

      if (data.components && data.components.length > 0) {
        await tx.examSubjectComponent.createMany({
          data: data.components.map((c: any) => ({
            examSubjectId: examSubject.id,
            componentId: c.componentId,
            maxMarks: c.maxMarks,
            passMarks: c.passMarks,
            weightage: c.weightage,
          })),
        });
      }

      await this.audit.log({
        action: 'exams.examination.subject.add',
        resource: 'ExamSubject',
        resourceId: examSubject.id,
        actorId,
        organizationId,
        schoolId: exam.schoolId,
      });

      return examSubject;
    });
  }

  async findAll(organizationId: string, filters: any) {
    return this.db.examination.findMany({
      where: {
        school: { organizationId },
        schoolId: filters.schoolId,
        academicYearId: filters.academicYearId,
        termId: filters.termId,
      },
      include: {
        examType: true,
        academicYear: true,
        term: true,
        _count: { select: { subjects: true, schedules: true } },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const examination = await this.db.examination.findFirst({
      where: { id, school: { organizationId } },
      include: {
        examType: true,
        subjects: {
          include: {
            subject: true,
            components: { include: { component: true } },
          },
        },
        schedules: {
          include: {
            subject: true,
            class: true,
            section: true,
            room: true,
            invigilator: true,
          },
        },
      },
    });
    if (!examination) throw new NotFoundException('Examination not found');
    return examination;
  }
}
