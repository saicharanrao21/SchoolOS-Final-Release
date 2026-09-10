import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { AccountingIntegrationService } from '../../accounting/accounting-integration.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class FeeAssignmentsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
    private readonly accounting: AccountingIntegrationService,
  ) {}

  async assignToStudent(organizationId: string, data: any, actorId: string) {
    const student = await this.db.student.findFirst({
      where: { id: data.studentId, school: { organizationId } },
    });
    if (!student) throw new NotFoundException('Student not found');

    const structure = await this.db.feeStructure.findFirst({
      where: { id: data.feeStructureId, school: { organizationId } },
      include: { installments: true },
    });
    if (!structure) throw new NotFoundException('Fee structure not found');

    return this.db.$transaction(async (tx) => {
      // 1. Create Assignment
      const assignment = await tx.feeAssignment.upsert({
        where: {
          studentId_feeStructureId: {
            studentId: student.id,
            feeStructureId: structure.id,
          },
        },
        update: { notes: data.notes },
        create: {
          studentId: student.id,
          feeStructureId: structure.id,
          notes: data.notes,
        },
      });

      // 2. Generate Invoices/Demands based on installments
      // If no installments, create one single demand
      if (structure.installments.length === 0) {
        await this.createDemand(tx, student.id, structure, null, actorId, organizationId);
      } else {
        for (const installment of structure.installments) {
          await this.createDemand(tx, student.id, structure, installment, actorId, organizationId);
        }
      }

      await this.audit.log({
        action: 'fee.assignment.create',
        resource: 'FeeAssignment',
        resourceId: assignment.id,
        actorId,
        organizationId,
        schoolId: student.schoolId,
        metadata: { studentId: student.id, structureId: structure.id },
      });

      return assignment;
    });
  }

  private async createDemand(tx: any, studentId: string, structure: any, installment: any | null, actorId: string, organizationId: string) {
    const invoiceNumber = await this.generateInvoiceNumber(tx, structure.schoolId);
    const amount = installment ? installment.amount : structure.totalAmount;
    const dueDate = installment ? installment.dueDate : new Date();

    const demand = await tx.feeDemand.create({
      data: {
        invoiceNumber,
        studentId,
        academicYearId: structure.academicYearId,
        dueDate,
        subtotal: amount,
        totalAmount: amount,
        balanceAmount: amount,
        components: {
          create: [{
            name: installment ? `${structure.name} - ${installment.name}` : structure.name,
            amount,
            installmentId: installment?.id,
          }],
        },
      },
    });

    // Update Student Fee Account
    await tx.studentFeeAccount.upsert({
      where: { studentId },
      update: {
        totalBilled: { increment: amount },
        balance: { increment: amount },
      },
      create: {
        studentId,
        totalBilled: amount,
        balance: amount,
      },
    });

    // Create Ledger Entry (Operational)
    await tx.financialLedgerEntry.create({
      data: {
        type: 'FEE_CHARGED',
        amount,
        studentId,
        organizationId,
        schoolId: structure.schoolId,
        description: `Fee demand raised: ${invoiceNumber}`,
      },
    });

    // Integrate with Accounting
    this.accounting.handleFeeIssued(organizationId, demand.id, actorId);

    return demand;
  }

  private async generateInvoiceNumber(tx: any, schoolId: string): Promise<string> {
    const year = new Date().getFullYear().toString();
    const count = await tx.feeDemand.count({
      where: { student: { schoolId } },
    });
    return `INV-${year}-${(count + 1).toString().padStart(6, '0')}`;
  }
}
