import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TimetableOperationsService } from './timetable-operations.service';

describe('TimetableOperationsService', () => {
  const db: any = {
    timetablePeriod: { findFirst: jest.fn(), findMany: jest.fn() },
    timetable: { findFirst: jest.fn() },
    location: { findFirst: jest.fn() },
    teacherSubjectAssignment: { findFirst: jest.fn() },
    teacherAvailability: { findMany: jest.fn() },
    timetableEntry: { findMany: jest.fn() },
    timetableVersion: { findFirst: jest.fn() },
    $transaction: jest.fn(),
  };
  const audit: any = { log: jest.fn() };
  const service = new TimetableOperationsService(db, audit);

  beforeEach(() => jest.clearAllMocks());

  it('rejects a period from another organization', async () => {
    db.timetablePeriod.findFirst.mockResolvedValue(null);
    await expect(service.validateSlot('org-a', { periodId: 'p1', timetableId: 't1', employeeId: 'e1', subjectId: 's1' }))
      .rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects a teacher without a matching academic assignment', async () => {
    db.timetablePeriod.findFirst.mockResolvedValue({ id: 'p1', schoolId: 'school-a', dayOfWeek: 1, startTime: '09:00', endTime: '10:00', school: {} });
    db.timetable.findFirst.mockResolvedValue({ id: 't1', schoolId: 'school-a', classId: 'c1', sectionId: 'sec1', academicYearId: 'ay1', class: {}, section: {} });
    db.teacherSubjectAssignment.findFirst.mockResolvedValue(null);
    await expect(service.validateSlot('org-a', { periodId: 'p1', timetableId: 't1', employeeId: 'e1', subjectId: 's1' }))
      .rejects.toBeInstanceOf(BadRequestException);
  });

  it('reports a room conflict without exposing foreign-school data', async () => {
    db.timetablePeriod.findFirst.mockResolvedValue({ id: 'p1', schoolId: 'school-a', dayOfWeek: 1, startTime: '09:00', endTime: '10:00', school: {} });
    db.timetable.findFirst.mockResolvedValue({ id: 't1', schoolId: 'school-a', classId: 'c1', sectionId: 'sec1', academicYearId: 'ay1', class: {}, section: {} });
    db.teacherSubjectAssignment.findFirst.mockResolvedValue({ id: 'a1' });
    db.teacherAvailability.findMany.mockResolvedValue([]);
    db.location.findFirst.mockResolvedValue({ id: 'r1' });
    db.timetableEntry.findMany.mockResolvedValue([{ id: 'e2', timetableVersionId: 'other', roomId: 'r1', employeeId: 'e2', subject: { name: 'Math' }, employee: { firstName: 'A', lastName: 'B' }, room: { name: 'Room 1' }, timetableVersion: { timetableId: 't2' } }]);
    const result = await service.validateSlot('org-a', { periodId: 'p1', timetableId: 't1', versionId: 'v1', employeeId: 'e1', subjectId: 's1', roomId: 'r1' });
    expect(result.valid).toBe(false);
    expect(result.conflicts[0].type).toBe('ROOM');
  });
});
