import { BadRequestException, NotFoundException } from '@nestjs/common';
import { HrComplianceService } from './hr-compliance.service';

describe('HrComplianceService', () => {
  const db: any = {
    employee: { findFirst: jest.fn(), count: jest.fn() },
    school: { findFirst: jest.fn() },
    employeeDocument: { create: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), update: jest.fn(), count: jest.fn() },
    performanceReview: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn(), findMany: jest.fn(), count: jest.fn() },
    employeeTraining: { create: jest.fn(), findMany: jest.fn(), count: jest.fn() },
  };
  const audit: any = { log: jest.fn() };
  let service: HrComplianceService;

  beforeEach(() => { jest.clearAllMocks(); service = new HrComplianceService(db, audit); });

  it('rejects documents for an employee outside the authenticated organization', async () => {
    db.employee.findFirst.mockResolvedValue(null);
    await expect(service.createDocument('org-a', { employeeId: 'emp-b', schoolId: 'school-b', documentType: 'ID', title: 'ID' }, 'actor'))
      .rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects a self-review', async () => {
    db.employee.findFirst.mockResolvedValue({ id: 'emp-1' });
    await expect(service.createReview('org-a', { employeeId: 'emp-1', reviewerId: 'emp-1', schoolId: 'school-a', reviewPeriod: '2026-27', reviewDate: '2026-09-01' }, 'actor'))
      .rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects ratings outside the five-point scale', async () => {
    db.employee.findFirst.mockResolvedValueOnce({ id: 'emp-1' }).mockResolvedValueOnce({ id: 'emp-2' });
    await expect(service.createReview('org-a', { employeeId: 'emp-1', reviewerId: 'emp-2', schoolId: 'school-a', reviewPeriod: '2026-27', reviewDate: '2026-09-01', overallRating: 7 }, 'actor'))
      .rejects.toBeInstanceOf(BadRequestException);
  });

  it('blocks edits to completed reviews', async () => {
    db.performanceReview.findFirst.mockResolvedValue({ id: 'r1', status: 'COMPLETED' });
    await expect(service.updateReview('org-a', 'r1', { managerComment: 'changed' }, 'actor'))
      .rejects.toBeInstanceOf(BadRequestException);
  });
});
