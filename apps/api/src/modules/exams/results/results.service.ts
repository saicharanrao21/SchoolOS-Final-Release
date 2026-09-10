import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { Prisma, ResultStatus } from '@prisma/client';

@Injectable()
export class ResultsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async calculateResults(organizationId: string, examinationId: string, classId: string, sectionId: string, actorId: string) {
    const exam = await this.db.examination.findUnique({
      where: { id: examinationId },
      include: {
        subjects: { include: { components: true } },
      },
    });

    if (!exam) throw new NotFoundException('Examination not found');

    const students = await this.db.student.findMany({
      where: { enrollments: { some: { classId, sectionId, academicYearId: exam.academicYearId } } },
    });

    return this.db.$transaction(async (tx: Prisma.TransactionClient) => {
      const results = [];

      for (const student of students) {
        let totalMarks = 0;
        let maxMarks = 0;
        const subjectResults = [];

        for (const examSubject of exam.subjects) {
          const marks = await tx.markEntryLine.findMany({
            where: {
              markEntry: { examinationId, examSubjectId: examSubject.id },
              studentId: student.id,
            },
          });

          let subjectObtained = 0;
          let subjectMax = examSubject.maxMarks;

          if (examSubject.components.length > 0) {
            for (const comp of examSubject.components) {
              const mark = marks.find(m => m.componentId === comp.componentId);
              if (mark && mark.marksObtained !== null) {
                // If weightage exists, use it, else raw marks
                const contribution = comp.weightage
                  ? (mark.marksObtained / comp.maxMarks) * (comp.weightage / 100) * examSubject.maxMarks
                  : mark.marksObtained;
                subjectObtained += contribution;
              }
            }
          } else {
            const mark = marks.find(m => m.componentId === null);
            subjectObtained = mark?.marksObtained || 0;
          }

          subjectResults.push({
            subjectId: examSubject.subjectId,
            marksObtained: subjectObtained,
            maxMarks: subjectMax,
            percentage: (subjectObtained / subjectMax) * 100,
            isPassing: subjectObtained >= examSubject.passMarks,
          });

          totalMarks += subjectObtained;
          maxMarks += subjectMax;
        }

        const percentage = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0;

        const result = await tx.result.upsert({
          where: {
            studentId_examinationId: { studentId: student.id, examinationId },
          },
          update: {
            totalMarks,
            maxMarks,
            percentage,
            status: ResultStatus.CALCULATED,
            overallResult: subjectResults.every(s => s.isPassing) ? 'PASS' : 'FAIL',
          },
          create: {
            studentId: student.id,
            examinationId,
            academicYearId: exam.academicYearId,
            classId,
            sectionId,
            totalMarks,
            maxMarks,
            percentage,
            status: ResultStatus.CALCULATED,
            overallResult: subjectResults.every(s => s.isPassing) ? 'PASS' : 'FAIL',
          },
        });

        // Subject-wise results
        for (const sRes of subjectResults) {
          await tx.resultSubject.upsert({
            where: { resultId_subjectId: { resultId: result.id, subjectId: sRes.subjectId } },
            update: { ...sRes },
            create: { resultId: result.id, ...sRes },
          });
        }

        results.push(result);
      }

      await this.audit.log({
        action: 'exams.results.calculate',
        resource: 'Examination',
        resourceId: examinationId,
        actorId,
        organizationId,
        schoolId: exam.schoolId,
        metadata: { studentCount: students.length },
      });

      return { success: true, count: results.length };
    });
  }

  async publish(organizationId: string, examinationId: string, classId: string, actorId: string) {
    const exam = await this.db.examination.findUnique({ where: { id: examinationId } });
    if (!exam) throw new NotFoundException('Examination not found');

    return this.db.$transaction(async (tx: Prisma.TransactionClient) => {
      const results = await tx.result.findMany({
        where: { examinationId, classId, status: { in: [ResultStatus.CALCULATED, ResultStatus.APPROVED] } },
        include: { subjects: { include: { subject: true } } },
      });

      for (const res of results) {
        await tx.result.update({
          where: { id: res.id },
          data: { status: ResultStatus.PUBLISHED, publishedAt: new Date() },
        });

        // Create immutable snapshot
        await tx.resultSnapshot.create({
          data: {
            resultId: res.id,
            data: res as any,
            version: 1,
            publishedById: actorId,
          },
        });
      }

      await this.audit.log({
        action: 'exams.results.publish',
        resource: 'Examination',
        resourceId: examinationId,
        actorId,
        organizationId,
        schoolId: exam.schoolId,
        metadata: { resultCount: results.length },
      });

      return { success: true, count: results.length };
    });
  }
}
