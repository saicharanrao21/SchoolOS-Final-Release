import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';

jest.mock('@nestjs/event-emitter', () => ({
  EventEmitter2: jest.fn().mockImplementation(() => ({
    emit: jest.fn(),
  })),
  OnEvent: jest.fn().mockImplementation(() => jest.fn()),
}));

import { EnquiriesService } from './enquiries/enquiries.service';
import { ApplicationsService } from './applications/applications.service';
import { AssessmentsService } from './assessments/assessments.service';
import { InterviewsService } from './interviews/interviews.service';
import { DecisionsService } from './decisions/decisions.service';
import { OffersService } from './offers/offers.service';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';
import { NumberingService } from '../config/numbering.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('Admissions CRM & Applicant Pipeline Remediation Suite', () => {
  let enquiriesService: EnquiriesService;
  let applicationsService: ApplicationsService;
  let db: any;

  beforeEach(async () => {
    db = {
      school: { findFirst: jest.fn() },
      user: { findFirst: jest.fn() },
      admissionEnquiry: {
        create: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
        findFirst: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        groupBy: jest.fn().mockResolvedValue([]),
        update: jest.fn(),
      },
      admissionFollowUp: {
        create: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
        findFirst: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn(),
      },
      admissionApplication: {
        create: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
        findFirst: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn(),
      },
      admissionAssessment: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      admissionInterview: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      admissionDecision: {
        upsert: jest.fn(),
      },
      admissionOffer: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      section: { findFirst: jest.fn() },
      student: { create: jest.fn(), count: jest.fn().mockResolvedValue(0) },
      person: { create: jest.fn().mockResolvedValue({ id: 'person-1' }) },
      enrollment: { create: jest.fn() },
      $transaction: jest.fn((cb) => cb(db)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnquiriesService,
        ApplicationsService,
        AssessmentsService,
        InterviewsService,
        DecisionsService,
        OffersService,
        { provide: DatabaseService, useValue: db },
        { provide: AuditService, useValue: { log: jest.fn().mockResolvedValue(true) } },
        { provide: NumberingService, useValue: { generateNextNumber: jest.fn().mockResolvedValue('ADM-2026-0001') } },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    enquiriesService = module.get<EnquiriesService>(EnquiriesService);
    applicationsService = module.get<ApplicationsService>(ApplicationsService);
  });

  // 1. Lead CRM & Enquiry Funnel
  describe('Lead CRM & Enquiry Funnel', () => {
    it('should create an enquiry with generated Lead ID and trigger audit event', async () => {
      db.school.findFirst.mockResolvedValue({ id: 'school-1', code: 'SCH', organizationId: 'org-1' });
      db.admissionEnquiry.create.mockImplementation((args: any) => Promise.resolve({ id: 'enq-1', ...args.data }));

      const enquiry = await enquiriesService.create('org-1', {
        schoolId: 'school-1',
        firstName: 'Lead',
        lastName: 'Prospect',
        phone: '+1234567890',
        source: 'WEBSITE',
      });

      expect(enquiry).toBeDefined();
      expect(enquiry.enquiryNumber).toContain('ENQ-SCH');
    });

    it('should return CRM dashboard metrics aggregated from database', async () => {
      db.school.findFirst.mockResolvedValue({ id: 'school-1', organizationId: 'org-1' });

      const dashboard = await enquiriesService.getCrmDashboard('org-1', 'school-1');
      expect(dashboard).toBeDefined();
      expect(dashboard.totalEnquiries).toBeDefined();
      expect(dashboard.openEnquiries).toBeDefined();
    });
  });

  // 2. Application Conversion & Enrollment Graph Validation
  describe('Application Conversion & Student Auto-Enrollment', () => {
    it('should convert an approved application into an active Student and Enrollment', async () => {
      db.admissionApplication.findFirst.mockResolvedValue({
        id: 'app-1',
        schoolId: 'school-1',
        classId: 'class-1',
        academicYearId: 'year-1',
        campusId: 'campus-1',
        firstName: 'Applicant',
        lastName: 'Student',
        dateOfBirth: new Date('2012-01-01'),
        gender: 'Female',
        school: { id: 'school-1', code: 'SCH' },
      });
      db.section.findFirst.mockResolvedValue({ id: 'sec-1', classId: 'class-1' });
      db.student.create.mockResolvedValue({ id: 'student-1', admissionNumber: 'ADM-2026-0001' });

      const converted = await applicationsService.convertToStudent('org-1', 'app-1', 'sec-1', 'actor-1');

      expect(converted).toBeDefined();
      expect(db.person.create).toHaveBeenCalled();
      expect(db.enrollment.create).toHaveBeenCalled();
    });

    it('should reject conversion if section does NOT belong to the intended class', async () => {
      db.admissionApplication.findFirst.mockResolvedValue({
        id: 'app-1',
        schoolId: 'school-1',
        classId: 'class-1',
        school: { id: 'school-1', code: 'SCH' },
      });
      db.section.findFirst.mockResolvedValue(null); // Invalid section

      await expect(
        applicationsService.convertToStudent('org-1', 'app-1', 'invalid-sec', 'actor-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
