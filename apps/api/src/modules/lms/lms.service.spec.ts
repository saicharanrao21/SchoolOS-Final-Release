import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LmsService } from './lms.service';

jest.mock('@nestjs/event-emitter', () => ({
  EventEmitter2: jest.fn().mockImplementation(() => ({
    emit: jest.fn(),
  })),
}));

describe('LmsService', () => {
  const db: any = {
    school: { findFirst: jest.fn() },
    class: { findFirst: jest.fn() },
    subject: { findFirst: jest.fn() },
    student: { findFirst: jest.fn() },
    lmsCourse: { findFirst: jest.fn(), count: jest.fn(), create: jest.fn(), update: jest.fn() },
    lmsEnrollment: { count: jest.fn(), upsert: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    lmsLiveClass: { count: jest.fn(), create: jest.fn(), findFirst: jest.fn() },
    lmsQuiz: { count: jest.fn(), create: jest.fn(), findFirst: jest.fn() },
    lmsQuizQuestion: { create: jest.fn() },
    lmsQuizAttempt: { count: jest.fn(), create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
    lmsLesson: { findFirst: jest.fn(), create: jest.fn() },
    lmsLessonResource: { create: jest.fn() },
    lmsLessonProgress: { findMany: jest.fn(), upsert: jest.fn() },
  };
  const audit: any = { log: jest.fn() };
  const events: any = { emit: jest.fn() };
  let service: LmsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new LmsService(db, audit, events);
  });

  it('rejects a course created against a foreign school', async () => {
    db.school.findFirst.mockResolvedValue(null);
    await expect(service.createCourse('org-a', 'user-a', { schoolId: 'school-b', title: 'Physics' })).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects enrollment when student is outside the school', async () => {
    db.lmsCourse.findFirst.mockResolvedValue({ id: 'course-a', status: 'PUBLISHED' });
    db.student.findFirst.mockResolvedValue(null);
    await expect(service.enrollStudent('org-a', 'school-a', 'course-a', 'student-b', 'user-a')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects progress updates when the student is not enrolled', async () => {
    db.student.findFirst.mockResolvedValue({ id: 'student-a' });
    db.lmsLesson.findFirst.mockResolvedValue({ id: 'lesson-a', module: { courseId: 'course-a' } });
    db.lmsEnrollment.findUnique.mockResolvedValue(null);
    await expect(service.updateProgress('org-a', 'school-a', 'lesson-a', 'student-a', 'user-a', { progressPct: 50 })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('clamps progress and marks completed at 100%', async () => {
    db.student.findFirst.mockResolvedValue({ id: 'student-a' });
    db.lmsLesson.findFirst.mockResolvedValue({ id: 'lesson-a', module: { courseId: 'course-a' } });
    db.lmsEnrollment.findUnique.mockResolvedValue({ id: 'enroll-a', status: 'ACTIVE' });
    db.lmsLessonProgress.upsert.mockResolvedValue({ id: 'progress-a', progressPct: 100, status: 'COMPLETED' });
    db.lmsEnrollment.update.mockResolvedValue({});
    const result = await service.updateProgress('org-a', 'school-a', 'lesson-a', 'student-a', 'user-a', { progressPct: 120 });
    expect(db.lmsLessonProgress.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { studentId_lessonId: { studentId: 'student-a', lessonId: 'lesson-a' } }, update: expect.objectContaining({ progressPct: 100, status: 'COMPLETED' }) }));
    expect(events.emit).toHaveBeenCalledWith('lms.lesson.completed', expect.objectContaining({ studentId: 'student-a' }));
    expect(result.status).toBe('COMPLETED');
  });
});
