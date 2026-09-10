import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class LmsService {
  constructor(private readonly db: DatabaseService, private readonly audit: AuditService, private readonly events: EventEmitter2) {}

  private async assertSchool(org: string, schoolId: string) {
    if (!schoolId) throw new BadRequestException('schoolId is required');
    const school = await this.db.school.findFirst({ where: { id: schoolId, organizationId: org }, select: { id: true } });
    if (!school) throw new NotFoundException('School not found in the current organization');
  }

  private async assertStudent(org: string, schoolId: string, studentId: string) {
    const student = await this.db.student.findFirst({ where: { id: studentId, schoolId, school: { organizationId: org } }, select: { id: true } });
    if (!student) throw new NotFoundException('Student not found in the current school');
  }

  private async course(org: string, schoolId: string, id: string) {
    const course = await this.db.lmsCourse.findFirst({ where: { id, organizationId: org, schoolId } });
    if (!course) throw new NotFoundException('Course not found in the current school');
    return course;
  }

  async dashboard(org: string, schoolId: string) {
    await this.assertSchool(org, schoolId);
    const [courses, published, enrollments, completed, liveUpcoming, quizzes] = await Promise.all([
      this.db.lmsCourse.count({ where: { organizationId: org, schoolId } }),
      this.db.lmsCourse.count({ where: { organizationId: org, schoolId, status: 'PUBLISHED' } }),
      this.db.lmsEnrollment.count({ where: { organizationId: org, schoolId, status: 'ACTIVE' } }),
      this.db.lmsEnrollment.count({ where: { organizationId: org, schoolId, status: 'COMPLETED' } }),
      this.db.lmsLiveClass.count({ where: { organizationId: org, schoolId, startsAt: { gte: new Date() }, status: 'SCHEDULED' } }),
      this.db.lmsQuiz.count({ where: { course: { organizationId: org, schoolId } } }),
    ]);
    return { courses, publishedCourses: published, activeEnrollments: enrollments, completedEnrollments: completed, upcomingLiveClasses: liveUpcoming, quizzes };
  }

  async listCourses(org: string, schoolId: string, status?: string) {
    await this.assertSchool(org, schoolId);
    return this.db.lmsCourse.findMany({
      where: { organizationId: org, schoolId, ...(status ? { status } : {}) },
      include: { subject: { select: { id: true, name: true, code: true } }, class: { select: { id: true, name: true } }, _count: { select: { modules: true, enrollments: true, quizzes: true } } },
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
    });
  }

  async createCourse(org: string, actor: string, data: any) {
    await this.assertSchool(org, data.schoolId);
    if (!data.title?.trim()) throw new BadRequestException('Course title is required');
    if (data.classId) {
      const c = await this.db.class.findFirst({ where: { id: data.classId, schoolId: data.schoolId } });
      if (!c) throw new BadRequestException('Class does not belong to this school');
    }
    if (data.subjectId) {
      const s = await this.db.subject.findFirst({ where: { id: data.subjectId, schoolId: data.schoolId } });
      if (!s) throw new BadRequestException('Subject does not belong to this school');
    }
    const course = await this.db.lmsCourse.create({ data: { organizationId: org, schoolId: data.schoolId, title: data.title.trim(), code: data.code?.trim() || null, description: data.description, classId: data.classId || null, subjectId: data.subjectId || null, academicYearId: data.academicYearId || null, createdById: actor, visibility: data.visibility || 'ENROLLED', thumbnailUrl: data.thumbnailUrl || null } });
    await this.audit.log({ action: 'lms.course.create', resource: 'LmsCourse', resourceId: course.id, actorId: actor, organizationId: org, schoolId: data.schoolId });
    return course;
  }

  async setCoursePublished(org: string, schoolId: string, id: string, actor: string, published: boolean) {
    await this.course(org, schoolId, id);
    const updated = await this.db.lmsCourse.update({ where: { id }, data: { status: published ? 'PUBLISHED' : 'DRAFT', publishedAt: published ? new Date() : null } });
    await this.audit.log({ action: `lms.course.${published ? 'publish' : 'unpublish'}`, resource: 'LmsCourse', resourceId: id, actorId: actor, organizationId: org, schoolId });
    this.events.emit('lms.course.status_changed', { organizationId: org, schoolId, courseId: id, status: updated.status });
    return updated;
  }

  async createModule(org: string, schoolId: string, courseId: string, actor: string, data: any) {
    await this.course(org, schoolId, courseId);
    if (!data.title?.trim()) throw new BadRequestException('Module title is required');
    const sequence = Number(data.sequence);
    if (!Number.isInteger(sequence) || sequence < 1) throw new BadRequestException('sequence must be a positive integer');
    const module = await this.db.lmsCourseModule.create({ data: { courseId, title: data.title.trim(), description: data.description, sequence, isPublished: Boolean(data.isPublished) } });
    await this.audit.log({ action: 'lms.module.create', resource: 'LmsCourseModule', resourceId: module.id, actorId: actor, organizationId: org, schoolId });
    return module;
  }

  async createLesson(org: string, schoolId: string, moduleId: string, actor: string, data: any) {
    const module = await this.db.lmsCourseModule.findFirst({ where: { id: moduleId, course: { organizationId: org, schoolId } } });
    if (!module) throw new NotFoundException('Course module not found in the current school');
    if (!data.title?.trim()) throw new BadRequestException('Lesson title is required');
    const sequence = Number(data.sequence);
    if (!Number.isInteger(sequence) || sequence < 1) throw new BadRequestException('sequence must be a positive integer');
    const lesson = await this.db.lmsLesson.create({ data: { moduleId, title: data.title.trim(), description: data.description, type: data.type || 'CONTENT', sequence, durationMinutes: data.durationMinutes == null ? null : Number(data.durationMinutes), content: data.content, isPublished: Boolean(data.isPublished), availableFrom: data.availableFrom ? new Date(data.availableFrom) : null, availableUntil: data.availableUntil ? new Date(data.availableUntil) : null } });
    await this.audit.log({ action: 'lms.lesson.create', resource: 'LmsLesson', resourceId: lesson.id, actorId: actor, organizationId: org, schoolId });
    return lesson;
  }

  async addResource(org: string, schoolId: string, lessonId: string, actor: string, data: any) {
    const lesson = await this.db.lmsLesson.findFirst({ where: { id: lessonId, module: { course: { organizationId: org, schoolId } } } });
    if (!lesson) throw new NotFoundException('Lesson not found in the current school');
    if (!data.title?.trim() || !data.url?.trim()) throw new BadRequestException('Resource title and URL are required');
    const resource = await this.db.lmsLessonResource.create({ data: { lessonId, title: data.title.trim(), type: data.type || 'LINK', url: data.url.trim(), mimeType: data.mimeType || null, fileSize: data.fileSize == null ? null : Number(data.fileSize) } });
    await this.audit.log({ action: 'lms.lesson.resource.add', resource: 'LmsLessonResource', resourceId: resource.id, actorId: actor, organizationId: org, schoolId });
    return resource;
  }

  async enrollStudent(org: string, schoolId: string, courseId: string, studentId: string, actor: string) {
    const course = await this.course(org, schoolId, courseId);
    await this.assertStudent(org, schoolId, studentId);
    if (course.status !== 'PUBLISHED') throw new BadRequestException('Only published courses can accept enrollments');
    const enrollment = await this.db.lmsEnrollment.upsert({ where: { studentId_courseId: { studentId, courseId } }, update: { status: 'ACTIVE', lastAccessedAt: new Date() }, create: { organizationId: org, schoolId, studentId, courseId, enrolledById: actor, status: 'ACTIVE' } });
    await this.audit.log({ action: 'lms.enrollment.create', resource: 'LmsEnrollment', resourceId: enrollment.id, actorId: actor, organizationId: org, schoolId, studentId });
    return enrollment;
  }

  async updateProgress(org: string, schoolId: string, lessonId: string, studentId: string, actor: string, data: any) {
    await this.assertStudent(org, schoolId, studentId);
    const lesson = await this.db.lmsLesson.findFirst({ where: { id: lessonId, module: { course: { organizationId: org, schoolId } } }, include: { module: { select: { courseId: true } } } });
    if (!lesson) throw new NotFoundException('Lesson not found in the current school');
    const enrollment = await this.db.lmsEnrollment.findUnique({ where: { studentId_courseId: { studentId, courseId: lesson.module.courseId } } });
    if (!enrollment || enrollment.status !== 'ACTIVE') throw new BadRequestException('Student is not enrolled in this course');
    const pct = Math.max(0, Math.min(100, Number(data.progressPct ?? 0)));
    const status = pct >= 100 ? 'COMPLETED' : pct > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';
    const progress = await this.db.lmsLessonProgress.upsert({ where: { studentId_lessonId: { studentId, lessonId } }, update: { organizationId: org, schoolId, progressPct: pct, status, lastPositionSeconds: Math.max(0, Number(data.lastPositionSeconds ?? 0)), lastAccessedAt: new Date(), startedAt: status !== 'NOT_STARTED' ? new Date() : undefined, completedAt: status === 'COMPLETED' ? new Date() : null }, create: { organizationId: org, schoolId, studentId, lessonId, progressPct: pct, status, lastPositionSeconds: Math.max(0, Number(data.lastPositionSeconds ?? 0)), lastAccessedAt: new Date(), startedAt: status !== 'NOT_STARTED' ? new Date() : null, completedAt: status === 'COMPLETED' ? new Date() : null } });
    await this.db.lmsEnrollment.update({ where: { id: enrollment.id }, data: { lastAccessedAt: new Date() } });
    if (status === 'COMPLETED') this.events.emit('lms.lesson.completed', { organizationId: org, schoolId, studentId, lessonId });
    return progress;
  }

  async studentProgress(org: string, schoolId: string, studentId: string) {
    await this.assertStudent(org, schoolId, studentId);
    return this.db.lmsLessonProgress.findMany({ where: { organizationId: org, schoolId, studentId }, include: { lesson: { include: { module: { select: { id: true, title: true, courseId: true } } } } }, orderBy: { updatedAt: 'desc' } });
  }

  async createLiveClass(org: string, schoolId: string, courseId: string, actor: string, data: any) {
    await this.course(org, schoolId, courseId);
    if (!data.title || !data.startsAt || !data.endsAt) throw new BadRequestException('title, startsAt and endsAt are required');
    const starts = new Date(data.startsAt); const ends = new Date(data.endsAt);
    if (Number.isNaN(starts.getTime()) || Number.isNaN(ends.getTime()) || ends <= starts) throw new BadRequestException('Invalid live class time window');
    const live = await this.db.lmsLiveClass.create({ data: { organizationId: org, schoolId, courseId, hostUserId: actor, title: data.title.trim(), description: data.description, startsAt: starts, endsAt: ends, meetingUrl: data.meetingUrl, provider: data.provider, status: 'SCHEDULED' } });
    await this.audit.log({ action: 'lms.live_class.create', resource: 'LmsLiveClass', resourceId: live.id, actorId: actor, organizationId: org, schoolId });
    this.events.emit('lms.live_class.scheduled', { organizationId: org, schoolId, courseId, liveClassId: live.id });
    return live;
  }

  async recordLiveAttendance(org: string, schoolId: string, liveClassId: string, userId: string, data: any) {
    const live = await this.db.lmsLiveClass.findFirst({ where: { id: liveClassId, organizationId: org, schoolId } });
    if (!live) throw new NotFoundException('Live class not found in the current school');
    const joinedAt = data.joinedAt ? new Date(data.joinedAt) : new Date();
    const leftAt = data.leftAt ? new Date(data.leftAt) : null;
    const minutes = leftAt ? Math.max(0, Math.round((leftAt.getTime() - joinedAt.getTime()) / 60000)) : Math.max(0, Number(data.attendanceMinutes ?? 0));
    return this.db.lmsLiveClassAttendance.upsert({ where: { liveClassId_userId: { liveClassId, userId } }, update: { joinedAt, leftAt, attendanceMinutes: minutes, status: leftAt ? 'ATTENDED' : 'JOINED' }, create: { liveClassId, userId, joinedAt, leftAt, attendanceMinutes: minutes, status: leftAt ? 'ATTENDED' : 'JOINED' } });
  }

  async createQuiz(org: string, schoolId: string, courseId: string, actor: string, data: any) {
    await this.course(org, schoolId, courseId);
    if (!data.title?.trim()) throw new BadRequestException('Quiz title is required');
    const quiz = await this.db.lmsQuiz.create({ data: { courseId, title: data.title.trim(), instructions: data.instructions, durationMinutes: data.durationMinutes == null ? null : Number(data.durationMinutes), attemptsAllowed: Math.max(1, Number(data.attemptsAllowed ?? 1)), passPercentage: data.passPercentage == null ? null : Number(data.passPercentage) } });
    await this.audit.log({ action: 'lms.quiz.create', resource: 'LmsQuiz', resourceId: quiz.id, actorId: actor, organizationId: org, schoolId });
    return quiz;
  }

  async addQuizQuestion(org: string, schoolId: string, quizId: string, actor: string, data: any) {
    const quiz = await this.db.lmsQuiz.findFirst({ where: { id: quizId, course: { organizationId: org, schoolId } } });
    if (!quiz) throw new NotFoundException('Quiz not found in the current school');
    if (!data.question?.trim()) throw new BadRequestException('Question is required');
    const question = await this.db.lmsQuizQuestion.create({ data: { quizId, question: data.question.trim(), type: data.type || 'SINGLE_CHOICE', points: Number(data.points ?? 1), sequence: Number(data.sequence), options: data.options, correctAnswer: data.correctAnswer, explanation: data.explanation } });
    await this.audit.log({ action: 'lms.quiz.question.create', resource: 'LmsQuizQuestion', resourceId: question.id, actorId: actor, organizationId: org, schoolId });
    return question;
  }

  async startQuizAttempt(org: string, schoolId: string, quizId: string, studentId: string, actor: string) {
    await this.assertStudent(org, schoolId, studentId);
    const quiz = await this.db.lmsQuiz.findFirst({ where: { id: quizId, course: { organizationId: org, schoolId }, status: 'PUBLISHED' } });
    if (!quiz) throw new NotFoundException('Published quiz not found in the current school');
    const previous = await this.db.lmsQuizAttempt.count({ where: { quizId, studentId } });
    if (previous >= quiz.attemptsAllowed) throw new BadRequestException('Attempt limit reached');
    return this.db.lmsQuizAttempt.create({ data: { quizId, studentId, attemptNo: previous + 1, status: 'IN_PROGRESS' } });
  }

  async submitQuizAttempt(org: string, schoolId: string, attemptId: string, studentId: string, actor: string, answers: any) {
    await this.assertStudent(org, schoolId, studentId);
    const attempt = await this.db.lmsQuizAttempt.findFirst({ where: { id: attemptId, studentId, quiz: { course: { organizationId: org, schoolId } } }, include: { quiz: { include: { questions: true } } } });
    if (!attempt || attempt.status !== 'IN_PROGRESS') throw new NotFoundException('Active quiz attempt not found');
    const answerMap = answers && typeof answers === 'object' ? answers : {};
    let score = 0; let possible = 0;
    for (const q of attempt.quiz.questions) {
      possible += Number(q.points);
      const expected = JSON.stringify(q.correctAnswer);
      const actual = JSON.stringify(answerMap[q.id]);
      if (expected === actual) score += Number(q.points);
    }
    const percentage = possible ? Number(((score / possible) * 100).toFixed(2)) : 0;
    const passed = attempt.quiz.passPercentage == null ? null : percentage >= attempt.quiz.passPercentage;
    const updated = await this.db.lmsQuizAttempt.update({ where: { id: attemptId }, data: { status: 'SUBMITTED', submittedAt: new Date(), score, percentage, passed, answers: answerMap } });
    await this.audit.log({ action: 'lms.quiz.attempt.submit', resource: 'LmsQuizAttempt', resourceId: attemptId, actorId: actor, organizationId: org, schoolId, studentId, metadata: { percentage, passed } });
    this.events.emit('lms.quiz.submitted', { organizationId: org, schoolId, studentId, quizId: attempt.quizId, attemptId, percentage, passed });
    return updated;
  }
}
