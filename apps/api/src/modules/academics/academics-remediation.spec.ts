import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';

jest.mock('@nestjs/event-emitter', () => ({
  EventEmitter2: jest.fn().mockImplementation(() => ({
    emit: jest.fn(),
  })),
  OnEvent: jest.fn().mockImplementation(() => jest.fn()),
}));

import { AcademicsOperationsService } from './academic-operations.service';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';
import { AuthorizationService } from '../../auth/policy/authorization.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('Academics & Academic Operations Remediation Suite', () => {
  let service: AcademicsOperationsService;
  let db: any;
  let authz: any;

  beforeEach(async () => {
    db = {
      school: { findFirst: jest.fn() },
      student: { findFirst: jest.fn() },
      academicYear: { findFirst: jest.fn(), update: jest.fn() },
      class: { findFirst: jest.fn() },
      section: { findFirst: jest.fn() },
      enrollment: { create: jest.fn(), updateMany: jest.fn() },
      studentPromotion: { create: jest.fn() },
      employee: { findFirst: jest.fn() },
      teacherSubjectAssignment: { findMany: jest.fn().mockResolvedValue([]) },
      timetableEntry: { findMany: jest.fn().mockResolvedValue([]) },
      $transaction: jest.fn((cb) => cb(db)),
    };

    authz = {
      canAccessScope: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AcademicsOperationsService,
        { provide: DatabaseService, useValue: db },
        { provide: AuditService, useValue: { log: jest.fn().mockResolvedValue(true) } },
        { provide: AuthorizationService, useValue: authz },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get<AcademicsOperationsService>(AcademicsOperationsService);
  });

  // 1. Student Promotion & Closed Session Defense
  describe('Student Promotion & Session Protection', () => {
    it('should promote student and create new ACTIVE enrollment record for target year', async () => {
      db.student.findFirst.mockResolvedValue({
        id: 'student-1',
        schoolId: 'school-1',
        enrollments: [{ classId: 'class-1', sectionId: 'sec-1', campusId: 'campus-1' }],
      });
      db.academicYear.findFirst.mockResolvedValue({ id: 'year-2', schoolId: 'school-1', name: '2026-27', status: 'ACTIVE' });
      db.class.findFirst.mockResolvedValue({ id: 'class-2', schoolId: 'school-1' });
      db.section.findFirst.mockResolvedValue({ id: 'sec-2', classId: 'class-2' });
      db.studentPromotion.create.mockResolvedValue({ id: 'promo-1' });

      const result = await service.promoteStudent('org-1', 'actor-1', {
        studentId: 'student-1',
        fromAcademicYearId: 'year-1',
        toAcademicYearId: 'year-2',
        toClassId: 'class-2',
        toSectionId: 'sec-2',
        promotionType: 'PROMOTED',
      });

      expect(result).toBeDefined();
      expect(db.enrollment.updateMany).toHaveBeenCalled();
      expect(db.enrollment.create).toHaveBeenCalled();
    });

    it('should REJECT promotion if target academic year is CLOSED', async () => {
      db.student.findFirst.mockResolvedValue({ id: 'student-1', schoolId: 'school-1', enrollments: [] });
      db.academicYear.findFirst.mockResolvedValue({ id: 'year-closed', schoolId: 'school-1', name: '2020', status: 'CLOSED' });

      await expect(
        service.promoteStudent('org-1', 'actor-1', {
          studentId: 'student-1',
          fromAcademicYearId: 'year-1',
          toAcademicYearId: 'year-closed',
          toClassId: 'class-2',
          toSectionId: 'sec-2',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // 2. Timetable Conflict Detection Engine
  describe('Timetable Conflict Detection', () => {
    it('should detect teacher double-booking conflicts', async () => {
      const entries = [
        { periodId: 'period-1', employeeId: 'teacher-1', roomId: 'room-1', sectionId: 'sec-1' },
        { periodId: 'period-1', employeeId: 'teacher-1', roomId: 'room-2', sectionId: 'sec-2' }, // Same teacher, same period
      ];

      const validation = await service.checkTimetableConflicts('school-1', entries);

      expect(validation.isValid).toBe(false);
      expect(validation.conflicts.length).toBeGreaterThan(0);
      expect(validation.conflicts[0]).toContain('teacher-1');
    });

    it('should pass validation when no period overlaps exist', async () => {
      const entries = [
        { periodId: 'period-1', employeeId: 'teacher-1', roomId: 'room-1', sectionId: 'sec-1' },
        { periodId: 'period-2', employeeId: 'teacher-1', roomId: 'room-1', sectionId: 'sec-1' }, // Different periods
      ];

      const validation = await service.checkTimetableConflicts('school-1', entries);

      expect(validation.isValid).toBe(true);
      expect(validation.conflicts.length).toBe(0);
    });
  });
});
