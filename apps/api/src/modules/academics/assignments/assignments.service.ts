import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { Prisma, AssignmentStatus, SubmissionStatus } from '@prisma/client';

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async create(organizationId: string, data: any, actorId: string) {
    const assignment = await this.db.assignment.create({
      data: {
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        type: data.type,
        subjectId: data.subjectId,
        classId: data.classId,
        sectionId: data.sectionId,
        employeeId: actorId, // Assuming teacher creates it
        academicYearId: data.academicYearId,
        dueDate: new Date(data.dueDate),
        priority: data.priority || 'NORMAL',
        schoolId: data.schoolId,
        status: AssignmentStatus.PUBLISHED, // Default to published for now
        attachments: {
          create: data.attachments?.map((a: any) => ({
            fileName: a.fileName,
            fileType: a.fileType,
            fileUrl: a.fileUrl,
            fileSize: a.fileSize,
          })),
        },
      },
      include: { attachments: true },
    });

    await this.audit.log({
      action: 'academics.assignment.create',
      resource: 'Assignment',
      resourceId: assignment.id,
      actorId,
      organizationId,
      schoolId: data.schoolId,
    });

    return assignment;
  }

  async findAll(organizationId: string, filters: any) {
    return this.db.assignment.findMany({
      where: {
        school: { organizationId },
        schoolId: filters.schoolId,
        classId: filters.classId,
        sectionId: filters.sectionId,
        subjectId: filters.subjectId,
        employeeId: filters.employeeId,
      },
      include: {
        subject: true,
        class: true,
        section: true,
        employee: true,
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async submit(studentId: string, assignmentId: string, data: any) {
    const assignment = await this.db.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) throw new NotFoundException('Assignment not found');

    const isLate = new Date() > assignment.dueDate;

    const submission = await this.db.assignmentSubmission.create({
      data: {
        assignmentId,
        studentId,
        content: data.content,
        isLate,
        attachments: {
          create: data.attachments?.map((a: any) => ({
            fileName: a.fileName,
            fileType: a.fileType,
            fileUrl: a.fileUrl,
          })),
        },
      },
    });

    return submission;
  }

  async review(submissionId: string, employeeId: string, data: any) {
    return this.db.$transaction(async (tx) => {
      const feedback = await tx.assignmentFeedback.upsert({
        where: { submissionId },
        update: {
          score: data.score,
          feedback: data.feedback,
          employeeId,
        },
        create: {
          submissionId,
          employeeId,
          score: data.score,
          feedback: data.feedback,
        },
      });

      await tx.assignmentSubmission.update({
        where: { id: submissionId },
        data: { status: SubmissionStatus.REVIEWED },
      });

      return feedback;
    });
  }

  async getSubmissions(assignmentId: string) {
    return this.db.assignmentSubmission.findMany({
      where: { assignmentId },
      include: {
        student: true,
        attachments: true,
        feedback: true,
      },
    });
  }
}
