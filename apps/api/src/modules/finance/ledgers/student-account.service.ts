import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { Prisma } from '@prisma/client';
import { AuditService } from '../../../audit/audit.service';

@Injectable()
export class StudentAccountService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async getAccountSummary(organizationId: string, studentId: string) {
    const student = await this.db.student.findFirst({
      where: { id: studentId, school: { organizationId } },
      include: {
        feeAccount: true,
        feeDemands: {
          orderBy: { dueDate: 'asc' },
          include: { components: true },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
          include: { receipt: true },
        },
        concessions: true,
      },
    });

    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async applyConcession(organizationId: string, data: any, actorId: string) {
    const student = await this.db.student.findFirst({
      where: { id: data.studentId, school: { organizationId } },
    });
    if (!student) throw new NotFoundException('Student not found');

    return this.db.$transaction(async (tx) => {
      const concession = await tx.feeConcession.create({
        data: {
          studentId: student.id,
          category: data.category,
          amount: new Prisma.Decimal(data.amount),
          isPercentage: data.isPercentage || false,
          reason: data.reason,
          authorizedById: actorId,
        },
      });

      // Update account
      await tx.studentFeeAccount.update({
        where: { studentId: student.id },
        data: {
          totalConcession: { increment: new Prisma.Decimal(data.amount) },
          balance: { decrement: new Prisma.Decimal(data.amount) },
        },
      });

      await this.audit.log({
        action: 'fee.concession.apply',
        resource: 'FeeConcession',
        resourceId: concession.id,
        actorId,
        organizationId,
        schoolId: student.schoolId,
      });

      return concession;
    });
  }
}
