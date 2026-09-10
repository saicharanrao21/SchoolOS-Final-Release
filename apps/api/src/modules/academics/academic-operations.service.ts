import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';
import { AuthorizationService } from '../../auth/policy/authorization.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuditSeverity } from '@prisma/client';

export interface PromoteStudentOptions {
  studentId: string;
  fromAcademicYearId: string;
  toAcademicYearId: string;
  toClassId: string;
  toSectionId: string;
  promotionType?: 'PROMOTED' | 'RETAINED' | 'DEMOTED';
  remarks?: string;
}

export interface BulkPromoteOptions {
  schoolId: string;
  fromAcademicYearId: string;
  toAcademicYearId: string;
  promotions: {
    studentId: string;
    fromClassId: string;
    fromSectionId: string;
    toClassId: string;
    toSectionId: string;
    promotionType?: 'PROMOTED' | 'RETAINED' | 'DEMOTED';
  }[];
}

@Injectable()
export class AcademicsOperationsService {
  private readonly logger = new Logger(AcademicsOperationsService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
    private readonly authz: AuthorizationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async promoteStudent(organizationId: string, actorId: string, options: PromoteStudentOptions) {
    const student = await this.db.student.findFirst({
      where: { id: options.studentId, school: { organizationId } },
      include: {
        enrollments: { where: { academicYearId: options.fromAcademicYearId, status: 'ACTIVE' } },
      },
    });

    if (!student) throw new NotFoundException('Student not found under organization');

    // Service Authorization
    const canAccess = await this.authz.canAccessScope(actorId, organizationId, student.schoolId);
    if (!canAccess) throw new ForbiddenException('Actor unauthorized for target school scope');

    // Target Academic Year & Graph Validation
    const toYear = await this.db.academicYear.findFirst({
      where: { id: options.toAcademicYearId, schoolId: student.schoolId },
    });
    if (!toYear) throw new BadRequestException('Target academic year not found in school');
    if (toYear.status === 'CLOSED' || toYear.status === 'ARCHIVED') {
      throw new BadRequestException(`Target academic year '${toYear.name}' is CLOSED/ARCHIVED`);
    }

    const toClass = await this.db.class.findFirst({
      where: { id: options.toClassId, schoolId: student.schoolId },
    });
    if (!toClass) throw new BadRequestException('Target class does not belong to school');

    const toSection = await this.db.section.findFirst({
      where: { id: options.toSectionId, classId: options.toClassId },
    });
    if (!toSection) throw new BadRequestException('Target section does not belong to target class');

    const currentEnrollment = student.enrollments[0];
    const fromClassId = currentEnrollment?.classId || options.toClassId;
    const fromSectionId = currentEnrollment?.sectionId || options.toSectionId;
    const campusId = currentEnrollment?.campusId || student.schoolId;

    return this.db.$transaction(async (tx) => {
      // 1. Mark active enrollment for previous year as COMPLETED/PROMOTED
      await tx.enrollment.updateMany({
        where: { studentId: options.studentId, academicYearId: options.fromAcademicYearId, status: 'ACTIVE' },
        data: { status: options.promotionType || 'PROMOTED' },
      });

      // 2. Create new active enrollment for target year
      const newEnrollment = await tx.enrollment.create({
        data: {
          studentId: options.studentId,
          schoolId: student.schoolId,
          campusId,
          academicYearId: options.toAcademicYearId,
          classId: options.toClassId,
          sectionId: options.toSectionId,
          enrollmentDate: new Date(),
          status: 'ACTIVE',
        },
      });

      // 3. Create StudentPromotion Audit Ledger
      const promotion = await tx.studentPromotion.create({
        data: {
          studentId: options.studentId,
          fromAcademicYearId: options.fromAcademicYearId,
          toAcademicYearId: options.toAcademicYearId,
          fromClassId,
          fromSectionId,
          toClassId: options.toClassId,
          toSectionId: options.toSectionId,
          promotionType: options.promotionType || 'PROMOTED',
          authorizedById: actorId,
          remarks: options.remarks,
        },
      });

      await this.audit.log({
        action: 'academics.student.promoted',
        resource: 'StudentPromotion',
        resourceId: promotion.id,
        actorId,
        organizationId,
        schoolId: student.schoolId,
        metadata: { studentId: options.studentId, type: options.promotionType || 'PROMOTED' },
      });

      this.eventEmitter.emit('academics.student.promoted', {
        studentId: options.studentId,
        fromYearId: options.fromAcademicYearId,
        toYearId: options.toAcademicYearId,
      });

      return { promotion, newEnrollment };
    });
  }

  async bulkPromoteStudents(organizationId: string, actorId: string, options: BulkPromoteOptions) {
    const canAccess = await this.authz.canAccessScope(actorId, organizationId, options.schoolId);
    if (!canAccess) throw new ForbiddenException('Actor unauthorized for target school scope');

    let successCount = 0;
    const failures: { studentId: string; reason: string }[] = [];

    for (const item of options.promotions) {
      try {
        await this.promoteStudent(organizationId, actorId, {
          studentId: item.studentId,
          fromAcademicYearId: options.fromAcademicYearId,
          toAcademicYearId: options.toAcademicYearId,
          toClassId: item.toClassId,
          toSectionId: item.toSectionId,
          promotionType: item.promotionType || 'PROMOTED',
        });
        successCount++;
      } catch (err: any) {
        failures.push({ studentId: item.studentId, reason: err.message });
      }
    }

    return { totalRequested: options.promotions.length, successCount, failureCount: failures.length, failures };
  }

  async rolloverAcademicYear(organizationId: string, schoolId: string, actorId: string, fromYearId: string, toYearId: string) {
    const canAccess = await this.authz.canAccessScope(actorId, organizationId, schoolId);
    if (!canAccess) throw new ForbiddenException('Actor unauthorized for target school scope');

    const [fromYear, toYear] = await Promise.all([
      this.db.academicYear.findFirst({ where: { id: fromYearId, schoolId } }),
      this.db.academicYear.findFirst({ where: { id: toYearId, schoolId } }),
    ]);

    if (!fromYear || !toYear) throw new NotFoundException('Academic year not found in school');

    return this.db.$transaction(async (tx) => {
      // Close old year
      await tx.academicYear.update({
        where: { id: fromYearId },
        data: { status: 'CLOSED', isCurrent: false },
      });

      // Activate new year
      await tx.academicYear.update({
        where: { id: toYearId },
        data: { status: 'ACTIVE', isCurrent: true },
      });

      await this.audit.log({
        action: 'academics.year.rollover',
        resource: 'AcademicYear',
        resourceId: toYearId,
        actorId,
        organizationId,
        schoolId,
        severity: AuditSeverity.HIGH,
        metadata: { fromYearId, toYearId },
      });

      return { status: 'SUCCESS', fromYear: fromYear.name, toYear: toYear.name };
    });
  }

  async checkTimetableConflicts(schoolId: string, entries: { periodId: string; employeeId: string; roomId?: string; sectionId?: string }[]) {
    const conflicts: string[] = [];

    const teacherSlots = new Set<string>();
    const roomSlots = new Set<string>();
    const sectionSlots = new Set<string>();

    for (const e of entries) {
      // 1. Teacher Conflict
      const teacherKey = `${e.employeeId}:${e.periodId}`;
      if (teacherSlots.has(teacherKey)) {
        conflicts.push(`Teacher ${e.employeeId} has a double-booking conflict in period ${e.periodId}`);
      }
      teacherSlots.add(teacherKey);

      // 2. Room Conflict
      if (e.roomId) {
        const roomKey = `${e.roomId}:${e.periodId}`;
        if (roomSlots.has(roomKey)) {
          conflicts.push(`Room ${e.roomId} has a double-booking conflict in period ${e.periodId}`);
        }
        roomSlots.add(roomKey);
      }

      // 3. Section Conflict
      if (e.sectionId) {
        const secKey = `${e.sectionId}:${e.periodId}`;
        if (sectionSlots.has(secKey)) {
          conflicts.push(`Section ${e.sectionId} has a double-booking conflict in period ${e.periodId}`);
        }
        sectionSlots.add(secKey);
      }
    }

    return { isValid: conflicts.length === 0, conflicts };
  }

  async getTeacherWorkload(organizationId: string, schoolId: string, employeeId: string) {
    const employee = await this.db.employee.findFirst({
      where: { id: employeeId, schoolId, school: { organizationId } },
    });
    if (!employee) throw new NotFoundException('Employee not found in school');

    const assignments = await this.db.teacherSubjectAssignment.findMany({
      where: { employeeId, status: 'ACTIVE' },
      include: { subject: true, class: true, section: true },
    });

    const entries = await this.db.timetableEntry.findMany({
      where: { employeeId, timetableVersion: { status: 'PUBLISHED' } },
      include: { period: true, subject: true, room: true },
    });

    return {
      employee: { id: employee.id, name: `${employee.firstName} ${employee.lastName}`, employeeId: employee.employeeId },
      assignedSubjectsCount: assignments.length,
      periodsPerWeek: entries.length,
      assignments,
      timetableEntries: entries,
    };
  }
}
