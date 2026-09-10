import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { Prisma, CorrectionStatus } from '@prisma/client';

@Injectable()
export class AttendanceCorrectionsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async request(organizationId: string, data: any, actorId: string) {
    const record = await this.db.studentAttendanceRecord.findFirst({
      where: { id: data.studentRecordId, session: { school: { organizationId } } },
      include: { session: true },
    });

    if (!record) throw new NotFoundException('Attendance record not found');

    const correction = await this.db.attendanceCorrection.create({
      data: {
        studentRecordId: data.studentRecordId,
        originalStatus: record.status,
        requestedStatus: data.requestedStatus,
        reason: data.reason,
        requestedById: actorId,
      },
    });

    await this.audit.log({
      action: 'attendance.correction.request',
      resource: 'AttendanceCorrection',
      resourceId: correction.id,
      actorId,
      organizationId,
      schoolId: record.session.schoolId,
    });

    return correction;
  }

  async review(organizationId: string, id: string, status: CorrectionStatus, actorId: string) {
    const correction = await this.db.attendanceCorrection.findUnique({
      where: { id },
      include: { studentRecord: { include: { session: true } } },
    });

    if (!correction) throw new NotFoundException('Correction request not found');

    return this.db.$transaction(async (tx: Prisma.TransactionClient) => {
      const updated = await tx.attendanceCorrection.update({
        where: { id },
        data: { status, reviewedById: actorId },
      });

      if (status === CorrectionStatus.APPROVED) {
        await tx.studentAttendanceRecord.update({
          where: { id: correction.studentRecordId },
          data: { status: correction.requestedStatus },
        });
      }

      await this.audit.log({
        action: `attendance.correction.${status.toLowerCase()}`,
        resource: 'AttendanceCorrection',
        resourceId: id,
        actorId,
        organizationId,
        schoolId: correction.studentRecord.session.schoolId,
      });

      return updated;
    });
  }
}
