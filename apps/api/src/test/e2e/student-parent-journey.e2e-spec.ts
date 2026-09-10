import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { TestFixtures } from './test-fixtures';

import { ParentService } from '../../modules/parent/parent.service';
import { ReportCardsService } from '../../modules/exams/report-cards/report-cards.service';
import { DmsService } from '../../modules/dms/dms.service';
import { ResultStatus } from '@prisma/client';

describe('Student & Parent Critical Lifecycle E2E (Phase 31 - Part 6 & 11)', () => {
  let db: any;
  let audit: any;
  let eventEmitter: any;
  let parentService: ParentService;
  let reportCardsService: ReportCardsService;
  let dmsService: DmsService;

  beforeEach(async () => {
    db = {
      guardianStudent: {
        findFirst: jest.fn(),
      },
      student: {
        findUnique: jest.fn(),
      },
      examination: {
        findUnique: jest.fn(),
      },
      result: {
        findMany: jest.fn(),
      },
      reportCard: {
        upsert: jest.fn(),
        findMany: jest.fn(),
      },
      reportCardTemplate: {
        findFirst: jest.fn().mockResolvedValue({ id: 'tmpl-1' }),
      },
      $transaction: jest.fn(cb => cb(db)),
    };

    audit = {
      log: jest.fn().mockResolvedValue(true),
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    dmsService = {
      uploadDocument: jest.fn().mockResolvedValue({ id: 'doc-1' }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParentService,
        ReportCardsService,
        { provide: DatabaseService, useValue: db },
        { provide: AuditService, useValue: audit },
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: DmsService, useValue: dmsService },
      ],
    }).compile();

    parentService = module.get<ParentService>(ParentService);
    reportCardsService = module.get<ReportCardsService>(ReportCardsService);
  });

  describe('Parent Access Control & Guardian Relationship Check', () => {
    it('should allow linked parent to verify guardian-child relationship', async () => {
      db.guardianStudent.findFirst.mockResolvedValue({ id: 'rel-1' });

      const rel = await parentService.verifyRelationship('usr-parent-a', 'stud-1');
      expect(rel).toEqual({ id: 'rel-1' });
    });

    it('should reject unlinked parent access to student data (ForbiddenException)', async () => {
      db.guardianStudent.findFirst.mockResolvedValue(null);

      await expect(
        parentService.verifyRelationship('usr-parent-b', 'stud-1')
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Report Card Compilation & DMS Integration E2E', () => {
    it('should compile published exam results into printable report cards and upload to DMS', async () => {
      const mockExam = {
        id: 'exam-1',
        name: 'Final Examination 2026',
        schoolId: 'school-a1',
        school: { name: 'Greenwood High' },
        academicYear: { name: '2026-2027' },
      };

      const mockResult = {
        id: 'res-1',
        totalMarks: 480,
        maxMarks: 500,
        percentage: 96.0,
        grade: 'A+',
        overallResult: 'PASS',
        rank: 1,
        student: {
          id: 'stud-1',
          userId: 'usr-student-a',
          firstName: 'John',
          lastName: 'Doe',
          admissionNumber: 'ADM-2026-001',
          enrollments: [{ class: { name: 'Grade 10' }, section: { name: 'A' } }],
        },
        subjects: [
          {
            subject: { name: 'Physics' },
            marksObtained: 98,
            maxMarks: 100,
            percentage: 98,
            grade: 'A+',
            isPassing: true,
          },
        ],
        snapshots: [],
      };

      db.examination.findUnique.mockResolvedValue(mockExam);
      db.result.findMany.mockResolvedValue([mockResult]);
      db.reportCard.upsert.mockResolvedValue({ id: 'rc-1' });

      const res = await reportCardsService.generateReportCards('org-tenant-a', 'exam-1', 'class-1', 'sec-1', 'usr-admin-a');

      expect(db.reportCard.upsert).toHaveBeenCalled();
      expect(dmsService.uploadDocument).toHaveBeenCalledWith(
        'org-tenant-a',
        expect.objectContaining({
          title: 'Report Card - Final Examination 2026',
          category: 'ACADEMIC',
          type: 'REPORT_CARD',
        }),
        'usr-admin-a'
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith('reportcard.generated', expect.any(Object));
      expect(res.generatedCount).toBe(1);
    });
  });
});
