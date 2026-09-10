import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { Prisma, AttendanceStatus, AttendanceSessionStatus } from '@prisma/client';

@Injectable()
export class AttendanceRecordsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async markBulk(organizationId: string, sessionId: string, records: any[], actorId: string) {
    const session = await this.db.attendanceSession.findFirst({
      where: { id: sessionId, school: { organizationId } },
    });

    if (!session) throw new NotFoundException('Attendance session not found');
    if (session.status === AttendanceSessionStatus.LOCKED) {
      throw new BadRequestException('Cannot mark attendance for a locked session');
    }

    return this.db.$transaction(async (tx: Prisma.TransactionClient) => {
      for (const record of records) {
        const result = await tx.studentAttendanceRecord.upsert({
          where: {
            sessionId_studentId: {
              sessionId,
              studentId: record.studentId,
            },
          },
          update: {
            status: record.status,
            remarks: record.remarks,
            checkInTime: record.checkInTime ? new Date(record.checkInTime) : undefined,
            checkOutTime: record.checkOutTime ? new Date(record.checkOutTime) : undefined,
            markedById: actorId,
          },
          create: {
            sessionId,
            studentId: record.studentId,
            status: record.status,
            remarks: record.remarks,
            checkInTime: record.checkInTime ? new Date(record.checkInTime) : undefined,
            checkOutTime: record.checkOutTime ? new Date(record.checkOutTime) : undefined,
            markedById: actorId,
          },
        });

        // Emit event for absence or lateness
        if (record.status === AttendanceStatus.ABSENT) {
          this.eventEmitter.emit('student.absent', {
            organizationId,
            schoolId: session.schoolId,
            studentId: record.studentId,
            date: session.date,
          });
        } else if (record.status === AttendanceStatus.LATE) {
          this.eventEmitter.emit('student.late', {
            organizationId,
            schoolId: session.schoolId,
            studentId: record.studentId,
            date: session.date,
          });
        }
      }

      // Update session status to IN_PROGRESS if it was OPEN
      if (session.status === AttendanceSessionStatus.OPEN) {
        await tx.attendanceSession.update({
          where: { id: sessionId },
          data: { status: AttendanceSessionStatus.IN_PROGRESS },
        });
      }

      await this.audit.log({
        action: 'attendance.mark_bulk',
        resource: 'AttendanceSession',
        resourceId: sessionId,
        actorId,
        organizationId,
        schoolId: session.schoolId,
        metadata: { count: records.length },
      });

      return { success: true, count: records.length };
    });
  }

  async getStudentStats(organizationId: string, studentId: string, academicYearId: string) {
    const student = await this.db.student.findFirst({
      where: { id: studentId, school: { organizationId } },
      select: { id: true, schoolId: true },
    });
    if (!student) throw new NotFoundException('Student not found');
    const records = await this.db.studentAttendanceRecord.findMany({
      where: {
        studentId: student.id,
        session: { academicYearId, schoolId: student.schoolId },
      },
      select: { status: true },
    });

    const total = records.length;
    const stats = records.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {} as any);

    return {
      total,
      stats,
      percentage: total > 0 ? ((stats[AttendanceStatus.PRESENT] || 0) / total) * 100 : 0,
    };
  }

  async getSchoolDailySummary(organizationId: string, schoolId: string, dateInput?: string) {
    const school = await this.db.school.findFirst({ where: { id: schoolId, organizationId }, select: { id: true, name: true } });
    if (!school) throw new NotFoundException('School not found');
    const date = new Date(dateInput || new Date());
    if (Number.isNaN(date.getTime())) throw new BadRequestException('Invalid date');
    date.setHours(0, 0, 0, 0);
    const next = new Date(date);
    next.setDate(next.getDate() + 1);

    const sessions = await this.db.attendanceSession.findMany({
      where: { schoolId, date: { gte: date, lt: next } },
      include: { section: { include: { class: true } }, studentRecords: { select: { status: true } } },
      orderBy: { createdAt: 'asc' },
    });
    const totals = sessions.flatMap((s) => s.studentRecords).reduce((acc, r) => {
      acc.total += 1;
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, { total: 0 } as Record<string, number>);
    const presentLike = (totals.PRESENT || 0) + (totals.LATE || 0);
    return {
      school, date, sessions: sessions.map((s) => ({ sessionId: s.id, type: s.type, className: s.section?.class?.name || null, sectionName: s.section?.name || null, status: s.status, total: s.studentRecords.length, present: s.studentRecords.filter((r) => r.status === AttendanceStatus.PRESENT).length, late: s.studentRecords.filter((r) => r.status === AttendanceStatus.LATE).length, absent: s.studentRecords.filter((r) => r.status === AttendanceStatus.ABSENT).length })),
      totals, attendanceRate: totals.total ? Number(((presentLike / totals.total) * 100).toFixed(2)) : 0,
    };
  }

  async getAtRiskStudents(organizationId: string, schoolId: string, academicYearId: string, threshold = 75) {
    const school = await this.db.school.findFirst({ where: { id: schoolId, organizationId }, select: { id: true } });
    if (!school) throw new NotFoundException('School not found');
    const students = await this.db.student.findMany({
      where: { schoolId, isActive: true, enrollments: { some: { schoolId, academicYearId, status: 'ACTIVE' } } },
      select: { id: true, admissionNumber: true, firstName: true, lastName: true },
      orderBy: { firstName: 'asc' },
    });
    const result = [];
    for (const student of students) {
      const records = await this.db.studentAttendanceRecord.findMany({
        where: { studentId: student.id, session: { schoolId, academicYearId } },
        select: { status: true, session: { select: { date: true } } },
        orderBy: { session: { date: 'desc' } },
      });
      if (!records.length) continue;
      const attended = records.filter((r) => r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE).length;
      const percentage = (attended / records.length) * 100;
      let consecutiveAbsences = 0;
      for (const record of records) {
        if (record.status === AttendanceStatus.ABSENT) consecutiveAbsences += 1;
        else break;
      }
      if (percentage < threshold || consecutiveAbsences >= 3) result.push({ ...student, totalSessions: records.length, attendedSessions: attended, attendancePercentage: Number(percentage.toFixed(2)), consecutiveAbsences, risk: percentage < 60 || consecutiveAbsences >= 5 ? 'HIGH' : 'MEDIUM' });
    }
    return result.sort((a, b) => a.attendancePercentage - b.attendancePercentage);
  }

  async markEmployeeAttendance(organizationId: string, schoolId: string, data: any, actorId: string) {
    const employee = await this.db.employee.findFirst({
      where: { id: data.employeeId, schoolId, school: { organizationId } },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    const date = new Date(data.date || new Date());
    date.setHours(0, 0, 0, 0);

    const record = await this.db.employeeAttendanceRecord.upsert({
      where: {
        date_employeeId: {
          date,
          employeeId: data.employeeId,
        },
      },
      update: {
        status: data.status,
        checkInTime: data.checkInTime ? new Date(data.checkInTime) : undefined,
        checkOutTime: data.checkOutTime ? new Date(data.checkOutTime) : undefined,
        remarks: data.remarks,
      },
      create: {
        date,
        employeeId: data.employeeId,
        status: data.status,
        checkInTime: data.checkInTime ? new Date(data.checkInTime) : undefined,
        checkOutTime: data.checkOutTime ? new Date(data.checkOutTime) : undefined,
        remarks: data.remarks,
        schoolId,
      },
    });

    await this.audit.log({
      action: 'attendance.employee.mark',
      resource: 'EmployeeAttendanceRecord',
      resourceId: record.id,
      actorId,
      organizationId,
      schoolId,
    });

    return record;
  }
}
