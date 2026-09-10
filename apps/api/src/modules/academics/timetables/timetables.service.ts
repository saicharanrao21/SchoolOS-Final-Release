import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { Prisma, TimetableStatus } from '@prisma/client';

@Injectable()
export class TimetablesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  private toMinutes(value: string): number {
    const match = /^(\d{2}):(\d{2})$/.exec(value || '');
    if (!match) return NaN;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours > 23 || minutes > 59) return NaN;
    return hours * 60 + minutes;
  }

  async createPeriod(organizationId: string, data: any, actorId: string) {
    const school = await this.db.school.findFirst({ where: { id: data.schoolId, organizationId } });
    if (!school) throw new NotFoundException('School not found');
    if (data.campusId) {
      const campus = await this.db.campus.findFirst({ where: { id: data.campusId, schoolId: data.schoolId } });
      if (!campus) throw new BadRequestException('Campus does not belong to the selected school');
    }
    if (!Number.isInteger(Number(data.dayOfWeek)) || Number(data.dayOfWeek) < 1 || Number(data.dayOfWeek) > 7) {
      throw new BadRequestException('dayOfWeek must be between 1 and 7');
    }
    if (!Number.isInteger(Number(data.periodNumber)) || Number(data.periodNumber) < 1) {
      throw new BadRequestException('periodNumber must be a positive integer');
    }
    const start = this.toMinutes(data.startTime);
    const end = this.toMinutes(data.endTime);
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) throw new BadRequestException('Period times must be valid and end after start');
    const period = await this.db.timetablePeriod.create({
      data: {
        schoolId: data.schoolId,
        campusId: data.campusId,
        dayOfWeek: data.dayOfWeek,
        periodNumber: data.periodNumber,
        startTime: data.startTime,
        endTime: data.endTime,
        isBreak: data.isBreak ?? false,
      },
    });

    await this.audit.log({
      action: 'academics.timetable_period.create',
      resource: 'TimetablePeriod',
      resourceId: period.id,
      actorId,
      organizationId,
      schoolId: data.schoolId,
    });

    return period;
  }

  async getPeriods(organizationId: string, schoolId: string, campusId?: string) {
    const school = await this.db.school.findFirst({ where: { id: schoolId, organizationId } });
    if (!school) throw new NotFoundException('School not found');
    return this.db.timetablePeriod.findMany({
      where: { schoolId, campusId, status: 'ACTIVE' },
      orderBy: [{ dayOfWeek: 'asc' }, { periodNumber: 'asc' }],
    });
  }

  async createTimetable(organizationId: string, data: any, actorId: string) {
    const school = await this.db.school.findFirst({ where: { id: data.schoolId, organizationId } });
    if (!school) throw new NotFoundException('School not found');
    const [academicYear, klass, section] = await Promise.all([
      this.db.academicYear.findFirst({ where: { id: data.academicYearId, schoolId: data.schoolId } }),
      this.db.class.findFirst({ where: { id: data.classId, schoolId: data.schoolId } }),
      this.db.section.findFirst({ where: { id: data.sectionId, class: { schoolId: data.schoolId } } }),
    ]);
    if (!academicYear || !klass || !section) throw new BadRequestException('Academic year, class and section must belong to the selected school');
    return this.db.$transaction(async (tx) => {
      const timetable = await tx.timetable.create({
        data: {
          name: data.name,
          academicYearId: data.academicYearId,
          classId: data.classId,
          sectionId: data.sectionId,
          schoolId: data.schoolId,
          status: TimetableStatus.DRAFT,
        },
      });

      const version = await tx.timetableVersion.create({
        data: {
          timetableId: timetable.id,
          versionNumber: 1,
          status: 'DRAFT',
        },
      });

      await this.audit.log({
        action: 'academics.timetable.create',
        resource: 'Timetable',
        resourceId: timetable.id,
        actorId,
        organizationId,
        schoolId: data.schoolId,
      });

      return { timetable, version };
    });
  }

  async saveDraft(organizationId: string, versionId: string, entries: any[], actorId: string) {
    const version = await this.db.timetableVersion.findFirst({
      where: { id: versionId, timetable: { school: { organizationId } } },
    });
    if (!version) throw new NotFoundException('Timetable version not found');

    return this.db.$transaction(async (tx) => {
      const timetable = await tx.timetable.findFirst({ where: { id: version.timetableId, school: { organizationId } } });
      if (!timetable) throw new NotFoundException('Timetable not found');
      if (!Array.isArray(entries)) throw new BadRequestException('Entries must be an array');

      const periodIds = [...new Set(entries.map((e: any) => e.periodId).filter(Boolean))];
      const subjectIds = [...new Set(entries.map((e: any) => e.subjectId).filter(Boolean))];
      const employeeIds = [...new Set(entries.map((e: any) => e.employeeId).filter(Boolean))];
      const roomIds = [...new Set(entries.map((e: any) => e.roomId).filter(Boolean))];

      const [periods, subjects, employees, rooms] = await Promise.all([
        tx.timetablePeriod.findMany({ where: { id: { in: periodIds }, schoolId: timetable.schoolId } }),
        tx.subject.findMany({ where: { id: { in: subjectIds }, schoolId: timetable.schoolId } }),
        tx.employee.findMany({ where: { id: { in: employeeIds }, schoolId: timetable.schoolId } }),
        roomIds.length ? tx.location.findMany({ where: { id: { in: roomIds }, campus: { schoolId: timetable.schoolId } } }) : [],
      ]);
      if (periods.length !== periodIds.length || subjects.length !== subjectIds.length || employees.length !== employeeIds.length || rooms.length !== roomIds.length) {
        throw new BadRequestException('One or more timetable references do not belong to this school');
      }

      const seen = new Set<string>();
      for (const e of entries) {
        if (!e.periodId || !e.subjectId || !e.employeeId) throw new BadRequestException('Every timetable entry requires period, subject and teacher');
        const key = `${e.periodId}:${e.employeeId}`;
        if (seen.has(key)) throw new BadRequestException('The same teacher cannot be assigned twice to one period in this version');
        seen.add(key);
      }

      // Clear existing entries only after all incoming references have been validated.
      await tx.timetableEntry.deleteMany({ where: { timetableVersionId: versionId } });
      const createdEntries = await tx.timetableEntry.createMany({ data: entries.map((e: any) => ({ timetableVersionId: versionId, periodId: e.periodId, subjectId: e.subjectId, employeeId: e.employeeId, roomId: e.roomId })) });

      return createdEntries;
    });
  }

  async validateTimetable(organizationId: string, versionId: string) {
    const version = await this.db.timetableVersion.findUnique({
      where: { id: versionId },
      include: {
        entries: {
          include: {
            period: true,
            employee: true,
            room: true,
            subject: true,
          },
        },
        timetable: true,
      },
    });

    if (!version || version.timetable.schoolId === undefined) throw new NotFoundException('Version not found');
    const school = await this.db.school.findFirst({ where: { id: version.timetable.schoolId, organizationId } });
    if (!school) throw new NotFoundException('Version not found');

    const conflicts: string[] = [];

    // 1. Teacher Conflicts
    const teacherSlots = new Map<string, string>(); // "teacherId-day-period" -> "entry-info"
    for (const entry of version.entries) {
      const key = `${entry.employeeId}-${entry.period.dayOfWeek}-${entry.period.periodNumber}`;
      if (teacherSlots.has(key)) {
        conflicts.push(`Teacher ${entry.employee.firstName} has a conflict at ${entry.period.startTime} on day ${entry.period.dayOfWeek}`);
      }
      teacherSlots.set(key, entry.id);
    }

    // 2. Room Conflicts
    const roomSlots = new Map<string, string>(); // "roomId-day-period" -> "entry-info"
    for (const entry of version.entries) {
      if (entry.roomId) {
        const key = `${entry.roomId}-${entry.period.dayOfWeek}-${entry.period.periodNumber}`;
        if (roomSlots.has(key)) {
          conflicts.push(`Room ${entry.room?.name} has a conflict at ${entry.period.startTime} on day ${entry.period.dayOfWeek}`);
        }
        roomSlots.set(key, entry.id);
      }
    }

    return {
      isValid: conflicts.length === 0,
      conflicts,
    };
  }

  async publish(organizationId: string, versionId: string, actorId: string) {
    const validation = await this.validateTimetable(organizationId, versionId);
    if (!validation.isValid) {
      throw new BadRequestException('Cannot publish timetable with conflicts: ' + validation.conflicts.join(', '));
    }

    return this.db.$transaction(async (tx) => {
      const version = await tx.timetableVersion.findUnique({
        where: { id: versionId },
        include: { timetable: true },
      });

      // Archive previous published versions of this timetable
      await tx.timetableVersion.updateMany({
        where: { timetableId: version!.timetableId, status: 'PUBLISHED' },
        data: { status: 'ARCHIVED' },
      });

      const updatedVersion = await tx.timetableVersion.update({
        where: { id: versionId },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          publishedById: actorId,
        },
      });

      await tx.timetable.update({
        where: { id: version!.timetableId },
        data: { status: TimetableStatus.PUBLISHED, currentVersion: version!.versionNumber },
      });

      await this.audit.log({
        action: 'academics.timetable.publish',
        resource: 'TimetableVersion',
        resourceId: versionId,
        actorId,
        organizationId,
        schoolId: version!.timetable.schoolId,
      });

      return updatedVersion;
    });
  }

  async getPublishedTimetable(classId: string, sectionId: string) {
    const timetable = await this.db.timetable.findFirst({
      where: { classId, sectionId, status: TimetableStatus.PUBLISHED },
      include: {
        versions: {
          where: { status: 'PUBLISHED' },
          include: {
            entries: {
              include: {
                period: true,
                subject: true,
                employee: true,
                room: true,
              },
            },
          },
        },
      },
    });

    return timetable?.versions[0] || null;
  }
}
