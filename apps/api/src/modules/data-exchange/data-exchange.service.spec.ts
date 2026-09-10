import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataExchangeService } from './data-exchange.service';

function makeService() {
  const db: any = {
    school: { findFirst: jest.fn() },
    importJob: { create: jest.fn(), findFirst: jest.fn(), findMany: jest.fn() },
    exportJob: { create: jest.fn(), findFirst: jest.fn(), findMany: jest.fn() },
  };
  const audit = { log: jest.fn() } as any;
  return { service: new DataExchangeService(db, audit), db, audit };
}

describe('DataExchangeService', () => {
  it('rejects unsupported import templates', () => {
    const { service } = makeService();
    expect(() => service.validateRows('UNKNOWN', [])).toThrow(BadRequestException);
  });

  it('detects missing fields, invalid email and duplicates', () => {
    const { service } = makeService();
    const result = service.validateRows('STUDENT', [
      { admissionNumber: 'A1', firstName: 'A', lastName: '', dateOfBirth: '2020-01-01', email: 'bad' },
      { admissionNumber: 'A1', firstName: 'B', lastName: 'B', dateOfBirth: '2020-01-01' },
    ]);
    expect(result.valid).toBe(false);
    expect(result.errorCount).toBeGreaterThanOrEqual(3);
  });

  it('enforces school ownership before creating an import', async () => {
    const { service, db } = makeService();
    db.school.findFirst.mockResolvedValue(null);
    await expect(service.createImportJob('org-a', { schoolId: 'school-b', template: 'STUDENT', filePath: '/tmp/a.csv' }, 'user-a')).rejects.toThrow(NotFoundException);
    expect(db.importJob.create).not.toHaveBeenCalled();
  });

  it('creates a validated export job for an owned school', async () => {
    const { service, db } = makeService();
    db.school.findFirst.mockResolvedValue({ id: 'school-a' });
    db.exportJob.create.mockResolvedValue({ id: 'exp-1', entity: 'STUDENTS', format: 'CSV' });
    const result = await service.createExportJob('org-a', { schoolId: 'school-a', entity: 'students', format: 'csv' }, 'user-a');
    expect(result.id).toBe('exp-1');
    expect(db.exportJob.create).toHaveBeenCalled();
    expect(db.exportJob.create.mock.calls[0][0].data.organizationId).toBe('org-a');
  });
});
