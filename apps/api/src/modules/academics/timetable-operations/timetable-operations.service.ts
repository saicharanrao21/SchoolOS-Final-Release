import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';

const toMinutes = (value: string): number => {
  const match = /^(\d{2}):(\d{2})$/.exec(value || '');
  if (!match) return NaN;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return NaN;
  return hours * 60 + minutes;
};

@Injectable()
export class TimetableOperationsService {
  constructor(private readonly db: DatabaseService, private readonly audit: AuditService) {}

  private async getPeriod(organizationId: string, periodId: string) {
    const period = await this.db.timetablePeriod.findFirst({
      where: { id: periodId, school: { organizationId } },
      include: { school: true },
    });
    if (!period) throw new NotFoundException('Timetable period not found');
    return period;
  }

  async validateSlot(organizationId: string, data: any) {
    const period = await this.getPeriod(organizationId, data.periodId);
    const timetable = await this.db.timetable.findFirst({
      where: { id: data.timetableId, school: { organizationId } },
      include: { class: true, section: true },
    });
    if (!timetable) throw new NotFoundException('Timetable not found');

    if (timetable.schoolId !== period.schoolId) {
      throw new BadRequestException('Timetable and period belong to different schools');
    }
    if (data.roomId) {
      const room = await this.db.location.findFirst({ where: { id: data.roomId, campus: { schoolId: period.schoolId } } });
      if (!room) throw new BadRequestException('Room does not belong to the timetable school');
    }

    const assignment = await this.db.teacherSubjectAssignment.findFirst({
      where: {
        employeeId: data.employeeId,
        subjectId: data.subjectId,
        classId: timetable.classId,
        academicYearId: timetable.academicYearId,
        status: 'ACTIVE',
        OR: [{ sectionId: null }, { sectionId: timetable.sectionId }],
        employee: { schoolId: timetable.schoolId },
      },
    });
    if (!assignment) {
      throw new BadRequestException('Teacher is not assigned to this subject/class for the academic year');
    }

    const availability = await this.db.teacherAvailability.findMany({
      where: {
        employeeId: data.employeeId,
        schoolId: timetable.schoolId,
        academicYearId: timetable.academicYearId,
        dayOfWeek: period.dayOfWeek,
      },
    });
    if (availability.length && !availability.some((a) => a.status === 'AVAILABLE' && toMinutes(a.startTime) <= toMinutes(period.startTime) && toMinutes(a.endTime) >= toMinutes(period.endTime))) {
      throw new BadRequestException('Teacher is unavailable during this period');
    }

    const existing = await this.db.timetableEntry.findMany({
      where: {
        periodId: period.id,
        timetableVersion: { timetable: { schoolId: timetable.schoolId, academicYearId: timetable.academicYearId } },
      },
      include: { timetableVersion: { include: { timetable: true } }, subject: true, employee: true, room: true },
    });

    const conflicts = existing.filter((entry) => entry.timetableVersionId !== data.versionId && (
      entry.employeeId === data.employeeId || (data.roomId && entry.roomId === data.roomId)
    )).map((entry) => ({
      type: entry.employeeId === data.employeeId ? 'TEACHER' : 'ROOM',
      entryId: entry.id,
      timetableId: entry.timetableVersion.timetableId,
      subject: entry.subject.name,
      teacher: `${entry.employee.firstName} ${entry.employee.lastName || ''}`.trim(),
      room: entry.room?.name || null,
    }));

    return {
      valid: conflicts.length === 0,
      period,
      conflicts,
      checks: { school: true, teacherAssignment: true, teacherAvailability: true, roomOwnership: true },
    };
  }

  async publishReadiness(organizationId: string, versionId: string) {
    const version = await this.db.timetableVersion.findFirst({
      where: { id: versionId, timetable: { school: { organizationId } } },
      include: { entries: { include: { period: true, employee: true, subject: true, room: true } }, timetable: true },
    });
    if (!version) throw new NotFoundException('Timetable version not found');

    const issues: Array<{ code: string; message: string; entryId?: string }> = [];
    const seenTeacher = new Set<string>();
    const seenRoom = new Set<string>();
    const seenSectionPeriod = new Set<string>();

    for (const entry of version.entries) {
      const sectionKey = `${entry.period.dayOfWeek}:${entry.period.periodNumber}`;
      if (seenSectionPeriod.has(sectionKey)) issues.push({ code: 'SECTION_DOUBLE_BOOKED', message: 'Section has multiple subjects in the same period', entryId: entry.id });
      seenSectionPeriod.add(sectionKey);

      const teacherKey = `${entry.employeeId}:${sectionKey}`;
      if (seenTeacher.has(teacherKey)) issues.push({ code: 'TEACHER_CONFLICT', message: 'Teacher is double-booked', entryId: entry.id });
      seenTeacher.add(teacherKey);

      if (entry.roomId) {
        const roomKey = `${entry.roomId}:${sectionKey}`;
        if (seenRoom.has(roomKey)) issues.push({ code: 'ROOM_CONFLICT', message: 'Room is double-booked', entryId: entry.id });
        seenRoom.add(roomKey);
      }

      const availability = await this.db.teacherAvailability.findMany({
        where: { employeeId: entry.employeeId, schoolId: version.timetable.schoolId, academicYearId: version.timetable.academicYearId, dayOfWeek: entry.period.dayOfWeek },
      });
      if (availability.length && !availability.some((a) => a.status === 'AVAILABLE' && toMinutes(a.startTime) <= toMinutes(entry.period.startTime) && toMinutes(a.endTime) >= toMinutes(entry.period.endTime))) {
        issues.push({ code: 'TEACHER_UNAVAILABLE', message: `Teacher ${entry.employee.firstName} is unavailable`, entryId: entry.id });
      }
    }

    return { ready: issues.length === 0, versionId, entryCount: version.entries.length, issues };
  }

  async cloneVersion(organizationId: string, versionId: string, actorId: string) {
    const source = await this.db.timetableVersion.findFirst({
      where: { id: versionId, timetable: { school: { organizationId } } },
      include: { timetable: true, entries: true },
    });
    if (!source) throw new NotFoundException('Timetable version not found');

    const nextNumber = source.timetable.currentVersion + 1;
    const result = await this.db.$transaction(async (tx) => {
      const version = await tx.timetableVersion.create({
        data: { timetableId: source.timetableId, versionNumber: nextNumber, status: 'DRAFT' },
      });
      if (source.entries.length) {
        await tx.timetableEntry.createMany({
          data: source.entries.map((entry) => ({
            timetableVersionId: version.id,
            periodId: entry.periodId,
            subjectId: entry.subjectId,
            employeeId: entry.employeeId,
            roomId: entry.roomId,
          })),
        });
      }
      return version;
    });

    await this.audit.log({
      action: 'academics.timetable.version.clone',
      resource: 'TimetableVersion',
      resourceId: result.id,
      actorId,
      organizationId,
      schoolId: source.timetable.schoolId,
      metadata: { sourceVersionId: versionId, versionNumber: nextNumber },
    });
    return result;
  }
}
