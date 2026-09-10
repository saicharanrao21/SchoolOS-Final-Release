import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

jest.mock('@nestjs/event-emitter', () => ({
  EventEmitter2: jest.fn().mockImplementation(() => ({
    emit: jest.fn(),
  })),
  OnEvent: jest.fn().mockImplementation(() => jest.fn()),
}));

import { StudentsService } from './students.service';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';
import { NumberingService } from '../config/numbering.service';
import { AuthorizationService } from '../../auth/policy/authorization.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('Phase 1.0.1 Student Hardening & Remediation Suite', () => {
  let service: StudentsService;
  let db: any;
  let authz: any;

  beforeEach(async () => {
    db = {
      school: { findFirst: jest.fn() },
      campus: { findFirst: jest.fn() },
      academicYear: { findFirst: jest.fn() },
      class: { findFirst: jest.fn() },
      section: { findFirst: jest.fn() },
      house: { findFirst: jest.fn() },
      student: {
        findFirst: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
        update: jest.fn(),
      },
      person: { create: jest.fn(), update: jest.fn() },
      enrollment: { create: jest.fn(), updateMany: jest.fn() },
      studentAttendanceRecord: { groupBy: jest.fn().mockResolvedValue([]) },
      studentFeeAccount: { findUnique: jest.fn().mockResolvedValue(null) },
      studentNote: { findMany: jest.fn().mockResolvedValue([]) },
      guardianStudent: { findFirst: jest.fn() },
      studentTransfer: { create: jest.fn() },
      $transaction: jest.fn((cb) => cb(db)),
    };

    authz = {
      canAccessScope: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        { provide: DatabaseService, useValue: db },
        { provide: AuditService, useValue: { log: jest.fn().mockResolvedValue(true) } },
        { provide: NumberingService, useValue: { generateNextNumber: jest.fn().mockResolvedValue('ADM-2026-0001') } },
        { provide: AuthorizationService, useValue: authz },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
  });

  // 1. Service Authorization
  describe('Service-Level Scope Authorization', () => {
    it('MUST BLOCK creating a student if actor is unauthorized for target school scope', async () => {
      authz.canAccessScope.mockResolvedValue(false);

      await expect(
        service.create('org-1', { schoolId: 'unauthorized-school', firstName: 'John', lastName: 'Doe', dateOfBirth: '2010-01-01' }, 'actor-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // 2. Enrollment Graph Validation
  describe('Enrollment Graph Consistency', () => {
    it('MUST REJECT enrollment if Campus does NOT belong to target School', async () => {
      db.school.findFirst.mockResolvedValue({ id: 'school-1', organizationId: 'org-1' });
      db.campus.findFirst.mockResolvedValue(null); // Campus invalid

      await expect(
        service.create(
          'org-1',
          {
            schoolId: 'school-1',
            firstName: 'Alice',
            lastName: 'Smith',
            dateOfBirth: '2010-02-02',
            enrollment: {
              campusId: 'invalid-campus',
              academicYearId: 'year-1',
              classId: 'class-1',
              sectionId: 'sec-1',
            },
          },
          'actor-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('MUST REJECT enrollment if AcademicYear is CLOSED or ARCHIVED', async () => {
      db.school.findFirst.mockResolvedValue({ id: 'school-1', organizationId: 'org-1' });
      db.campus.findFirst.mockResolvedValue({ id: 'campus-1', schoolId: 'school-1' });
      db.academicYear.findFirst.mockResolvedValue({ id: 'year-closed', schoolId: 'school-1', name: '2020', status: 'CLOSED' });

      await expect(
        service.create(
          'org-1',
          {
            schoolId: 'school-1',
            firstName: 'Bob',
            lastName: 'Jones',
            dateOfBirth: '2010-03-03',
            enrollment: {
              campusId: 'campus-1',
              academicYearId: 'year-closed',
              classId: 'class-1',
              sectionId: 'sec-1',
            },
          },
          'actor-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // 3. Parent IDOR Defense in Student 360
  describe('Parent & Student IDOR Defense in Student 360', () => {
    it('MUST BLOCK parent from viewing Student 360 if NOT an authorized linked guardian', async () => {
      db.student.findFirst.mockResolvedValue({
        id: 'student-1',
        schoolId: 'school-1',
        enrollments: [],
        guardians: [],
        documents: [],
      });
      db.guardianStudent.findFirst.mockResolvedValue(null); // Unlinked parent

      await expect(
        service.getStudent360('org-1', 'student-1', { id: 'parent-unauthorized', roles: ['PARENT'] }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('MUST ALLOW parent access if guardian relationship is verified', async () => {
      db.student.findFirst.mockResolvedValue({
        id: 'student-1',
        schoolId: 'school-1',
        enrollments: [],
        guardians: [],
        documents: [],
      });
      db.guardianStudent.findFirst.mockResolvedValue({ studentId: 'student-1' }); // Verified parent

      const result = await service.getStudent360('org-1', 'student-1', { id: 'parent-verified', roles: ['PARENT'] });
      expect(result).toBeDefined();
    });
  });
});
