import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { Prisma, LeaveStatus, AttendanceStatus } from '@prisma/client';

@Injectable()
export class LeaveRequestsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async submit(organizationId: string, data: any, actorId: string) {
    // Basic validation
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    if (startDate > endDate) throw new BadRequestException('Start date after end date');

    const request = await this.db.leaveRequest.create({
      data: {
        employeeId: data.employeeId,
        studentId: data.studentId,
        leaveTypeId: data.leaveTypeId,
        startDate,
        endDate,
        days: data.days,
        reason: data.reason,
        status: LeaveStatus.SUBMITTED,
      },
    });

    const schoolId = await this.getSchoolId(data);

    await this.audit.log({
      action: 'leave.request.submit',
      resource: 'LeaveRequest',
      resourceId: request.id,
      actorId,
      organizationId,
      schoolId,
    });

    return request;
  }

  private async getSchoolId(data: any): Promise<string> {
    if (data.studentId) {
      const s = await this.db.student.findUnique({ where: { id: data.studentId } });
      return s?.schoolId || '';
    }
    if (data.employeeId) {
      const e = await this.db.employee.findUnique({ where: { id: data.employeeId } });
      return e?.schoolId || '';
    }
    return '';
  }

  async approve(organizationId: string, id: string, status: LeaveStatus, actorId: string, remarks?: string) {
    const request = await this.db.leaveRequest.findUnique({
      where: { id },
      include: { leaveType: true },
    });

    if (!request) throw new NotFoundException('Leave request not found');

    return this.db.$transaction(async (tx) => {
      const updated = await tx.leaveRequest.update({
        where: { id },
        data: { status, reviewedById: actorId, remarks },
      });

      if (status === LeaveStatus.APPROVED) {
        // Impact attendance
        await this.impactAttendance(tx, updated);
      }

      const schoolId = await this.getSchoolId(request);

      await this.audit.log({
        action: `leave.request.${status.toLowerCase()}`,
        resource: 'LeaveRequest',
        resourceId: id,
        actorId,
        organizationId,
        schoolId,
      });

      return updated;
    });
  }

  private async impactAttendance(tx: Prisma.TransactionClient, request: any) {
    // For each date in range, create/update attendance record as ON_LEAVE
    const start = new Date(request.startDate);
    const end = new Date(request.endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
       const date = new Date(d);
       date.setHours(0,0,0,0);

       if (request.studentId) {
         // Find active session for this student's section on this date
         // For simplicity, we find sessions for that date
         const sessions = await tx.attendanceSession.findMany({
           where: { date, studentRecords: { some: { studentId: request.studentId } } }
         });

         for (const session of sessions) {
           await tx.studentAttendanceRecord.upsert({
             where: { sessionId_studentId: { sessionId: session.id, studentId: request.studentId } },
             update: { status: AttendanceStatus.ON_LEAVE },
             create: {
               sessionId: session.id,
               studentId: request.studentId,
               status: AttendanceStatus.ON_LEAVE,
               markedById: 'SYSTEM'
             }
           });
         }
       }

       if (request.employeeId) {
         await tx.employeeAttendanceRecord.upsert({
           where: { date_employeeId: { date, employeeId: request.employeeId } },
           update: { status: AttendanceStatus.ON_LEAVE },
           create: {
             date,
             employeeId: request.employeeId,
             status: AttendanceStatus.ON_LEAVE,
             schoolId: (await tx.employee.findUnique({ where: { id: request.employeeId } }))?.schoolId || ''
           }
         });
       }
    }
  }
}
