import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { DmsService } from '../../dms/dms.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ResultStatus } from '@prisma/client';

jest.mock('@nestjs/event-emitter', () => ({
  EventEmitter2: jest.fn().mockImplementation(() => ({
    emit: jest.fn(),
  })),
  OnEvent: jest.fn().mockImplementation(() => jest.fn()),
}));

import { EventEmitter2 } from '@nestjs/event-emitter';
import { ReportCardsService } from './report-cards.service';

describe('ReportCardsService', () => {
  let service: ReportCardsService;
  let db: any;
  let audit: any;
  let eventEmitter: any;
  let dms: any;

  beforeEach(async () => {
    db = {
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
        create: jest.fn(),
      },
      student: {
        findUnique: jest.fn(),
      },
      guardianStudent: {
        findFirst: jest.fn(),
      },
    };

    audit = {
      log: jest.fn().mockResolvedValue(true),
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    dms = {
      uploadDocument: jest.fn().mockResolvedValue({ id: 'doc-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportCardsService,
        { provide: DatabaseService, useValue: db },
        { provide: AuditService, useValue: audit },
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: DmsService, useValue: dms },
      ],
    }).compile();

    service = module.get<ReportCardsService>(ReportCardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateReportCards', () => {
    it('should throw NotFoundException if examination does not exist', async () => {
      db.examination.findUnique.mockResolvedValue(null);

      await expect(
        service.generateReportCards('org-1', 'exam-99', 'class-1', 'sec-1', 'user-1')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if no published results exist for class', async () => {
      db.examination.findUnique.mockResolvedValue({
        id: 'exam-1',
        name: 'Final Term',
        school: { name: 'Greenwood High' },
        academicYear: { name: '2026-2027' },
      });
      db.result.findMany.mockResolvedValue([]);

      await expect(
        service.generateReportCards('org-1', 'exam-1', 'class-1', 'sec-1', 'user-1')
      ).rejects.toThrow(BadRequestException);
    });

    it('should generate report cards and upload document metadata to DMS', async () => {
      const mockExam = {
        id: 'exam-1',
        name: 'Final Term',
        schoolId: 'school-1',
        school: { name: 'Greenwood High' },
        academicYear: { name: '2026-2027' },
      };

      const mockResult = {
        id: 'res-1',
        totalMarks: 450,
        maxMarks: 500,
        percentage: 90.0,
        grade: 'A+',
        overallResult: 'PASS',
        rank: 1,
        student: {
          id: 'stud-1',
          userId: 'usr-stud-1',
          firstName: 'John',
          lastName: 'Doe',
          admissionNumber: 'ADM-001',
          enrollments: [{ class: { name: 'Grade 10' }, section: { name: 'A' } }],
        },
        subjects: [
          {
            subject: { name: 'Mathematics' },
            marksObtained: 95,
            maxMarks: 100,
            percentage: 95,
            grade: 'A+',
            isPassing: true,
          },
        ],
        snapshots: [],
      };

      db.examination.findUnique.mockResolvedValue(mockExam);
      db.result.findMany.mockResolvedValue([mockResult]);
      db.reportCard.upsert.mockResolvedValue({ id: 'rc-1' });

      const result = await service.generateReportCards('org-1', 'exam-1', 'class-1', 'sec-1', 'user-1');

      expect(db.reportCard.upsert).toHaveBeenCalled();
      expect(dms.uploadDocument).toHaveBeenCalledWith(
        'org-1',
        expect.objectContaining({
          title: 'Report Card - Final Term',
          category: 'ACADEMIC',
          type: 'REPORT_CARD',
        }),
        'user-1'
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith('reportcard.generated', expect.any(Object));
      expect(result.generatedCount).toBe(1);
    });
  });

  describe('getStudentReportCards', () => {
    it('should throw ForbiddenException if requester is neither student nor authorized guardian', async () => {
      db.student.findUnique.mockResolvedValue({
        id: 'stud-1',
        userId: 'usr-stud-1',
      });
      db.guardianStudent.findFirst.mockResolvedValue(null);

      await expect(
        service.getStudentReportCards('stud-1', 'usr-unauthorized')
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return report cards if requester is authorized guardian', async () => {
      db.student.findUnique.mockResolvedValue({
        id: 'stud-1',
        userId: 'usr-stud-1',
      });
      db.guardianStudent.findFirst.mockResolvedValue({ id: 'gs-1' });
      db.reportCard.findMany.mockResolvedValue([{ id: 'rc-1' }]);

      const cards = await service.getStudentReportCards('stud-1', 'usr-guardian-1');

      expect(db.reportCard.findMany).toHaveBeenCalledWith({
        where: { studentId: 'stud-1' },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
      expect(cards.length).toBe(1);
    });
  });
});
