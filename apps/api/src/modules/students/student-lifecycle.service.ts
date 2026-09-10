import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';
import { StudentStatus } from '@prisma/client';

@Injectable()
export class StudentLifecycleService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async transfer(organizationId: string, data: any, actorId?: string) {
    const student = await this.db.student.findFirst({
      where: { id: data.studentId, school: { organizationId } },
    });
    if (!student) throw new NotFoundException('Student not found');

    return this.db.$transaction(async (tx) => {
      const transfer = await tx.studentTransfer.create({
        data: {
          studentId: data.studentId,
          fromSchoolId: student.schoolId,
          toSchoolId: data.toSchoolId,
          fromCampusId: data.fromCampusId,
          toCampusId: data.toCampusId,
          reason: data.reason,
          authorizedById: actorId || '',
          notes: data.notes,
        },
      });

      await tx.student.update({
        where: { id: data.studentId },
        data: { status: StudentStatus.TRANSFERRED },
      });

      await this.audit.log({
        action: 'student.transfer',
        resource: 'Student',
        resourceId: data.studentId,
        actorId,
        organizationId,
        schoolId: student.schoolId,
        metadata: { transferId: transfer.id },
      });

      return transfer;
    });
  }

  async withdraw(organizationId: string, data: any, actorId?: string) {
    const student = await this.db.student.findFirst({
      where: { id: data.studentId, school: { organizationId } },
    });
    if (!student) throw new NotFoundException('Student not found');

    return this.db.$transaction(async (tx) => {
      const withdrawal = await tx.studentWithdrawal.create({
        data: {
          studentId: data.studentId,
          reason: data.reason,
          authorizedById: actorId || '',
          notes: data.notes,
        },
      });

      await tx.student.update({
        where: { id: data.studentId },
        data: { status: StudentStatus.WITHDRAWN },
      });

      await this.audit.log({
        action: 'student.withdrawal',
        resource: 'Student',
        resourceId: data.studentId,
        actorId,
        organizationId,
        schoolId: student.schoolId,
        metadata: { withdrawalId: withdrawal.id },
      });

      return withdrawal;
    });
  }
}
