import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';

@Injectable()
export class CbtExamService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  // --- Question Bank ---

  async createQuestion(organizationId: string, schoolId: string, data: any, actorId: string) {
    const question = await this.db.cbtQuestionBank.create({
      data: {
        organizationId,
        schoolId,
        subjectId: data.subjectId,
        question: data.question,
        questionType: data.questionType || 'MULTIPLE_CHOICE',
        options: data.options || [],
        correctAnswer: data.correctAnswer,
        marks: data.marks || 1.0,
        difficulty: data.difficulty || 'MEDIUM',
        explanation: data.explanation,
      },
    });

    await this.audit.log({
      action: 'exams.cbt.question.create',
      resource: 'CbtQuestionBank',
      resourceId: question.id,
      actorId,
      organizationId,
      schoolId,
    });

    return question;
  }

  async getQuestions(organizationId: string, schoolId: string, subjectId?: string) {
    return this.db.cbtQuestionBank.findMany({
      where: {
        schoolId,
        school: { organizationId },
        ...(subjectId ? { subjectId } : {}),
      },
      include: { subject: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // --- CBT Exams ---

  async createCbtExam(organizationId: string, schoolId: string, data: any, actorId: string) {
    const exam = await this.db.cbtExam.create({
      data: {
        organizationId,
        schoolId,
        classId: data.classId,
        subjectId: data.subjectId,
        title: data.title,
        description: data.description,
        durationMinutes: data.durationMinutes || 60,
        totalMarks: data.totalMarks || 100,
        passingMarks: data.passingMarks || 40,
        startWindow: new Date(data.startWindow),
        endWindow: new Date(data.endWindow),
        createdById: actorId,
        isPublished: true,
      },
    });

    await this.audit.log({
      action: 'exams.cbt.exam.create',
      resource: 'CbtExam',
      resourceId: exam.id,
      actorId,
      organizationId,
      schoolId,
    });

    return exam;
  }

  async getCbtExams(organizationId: string, schoolId: string, classId?: string) {
    return this.db.cbtExam.findMany({
      where: {
        schoolId,
        school: { organizationId },
        ...(classId ? { classId } : {}),
      },
      include: { class: true, subject: true },
      orderBy: { startWindow: 'desc' },
    });
  }

  // --- Student Attempt & Auto-Evaluation ---

  async startAttempt(organizationId: string, cbtExamId: string, userId: string) {
    const student = await this.db.student.findFirst({ where: { userId } });
    if (!student) throw new NotFoundException('Student profile not found');

    const exam = await this.db.cbtExam.findUnique({ where: { id: cbtExamId }, include: { subject: true } });
    if (!exam) throw new NotFoundException('CBT Exam not found');

    const now = new Date();
    if (now < exam.startWindow || now > exam.endWindow) {
      throw new BadRequestException('Exam window is not currently active');
    }

    let attempt = await this.db.cbtExamAttempt.findFirst({
      where: { cbtExamId, studentId: student.id, status: 'IN_PROGRESS' },
    });

    if (!attempt) {
      attempt = await this.db.cbtExamAttempt.create({
        data: {
          cbtExamId,
          studentId: student.id,
          status: 'IN_PROGRESS',
          startedAt: new Date(),
        },
      });
    }

    const questions = await this.db.cbtQuestionBank.findMany({
      where: { schoolId: exam.schoolId, subjectId: exam.subjectId },
      take: 50,
    });

    return {
      attempt,
      exam,
      questions: questions.map((q) => ({
        id: q.id,
        question: q.question,
        questionType: q.questionType,
        options: q.options,
        marks: q.marks,
      })),
    };
  }

  async submitAttempt(organizationId: string, attemptId: string, userId: string, answers: Record<string, string>) {
    const attempt = await this.db.cbtExamAttempt.findUnique({
      where: { id: attemptId },
      include: { cbtExam: true },
    });

    if (!attempt || attempt.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Attempt is invalid or already submitted');
    }

    const questions = await this.db.cbtQuestionBank.findMany({
      where: { schoolId: attempt.cbtExam.schoolId, subjectId: attempt.cbtExam.subjectId },
    });

    let score = 0;
    for (const q of questions) {
      const studentAnswer = answers[q.id];
      if (studentAnswer && studentAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
        score += q.marks;
      }
    }

    const updated = await this.db.cbtExamAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'EVALUATED',
        submittedAt: new Date(),
        evaluatedAt: new Date(),
        score,
        answers: answers || {},
      },
    });

    return {
      attempt: updated,
      score,
      totalMarks: attempt.cbtExam.totalMarks,
      passed: score >= attempt.cbtExam.passingMarks,
    };
  }
}
