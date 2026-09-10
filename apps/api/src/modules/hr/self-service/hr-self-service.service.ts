import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';

@Injectable()
export class HrSelfServiceService {
  constructor(private readonly db: DatabaseService) {}

  async applyLoan(userId: string, data: any) {
    const employee = await this.db.employee.findUnique({ where: { userId } });
    if (!employee) throw new NotFoundException('Employee not found');

    return this.db.employeeLoan.create({
      data: {
        employeeId: employee.id,
        type: data.type,
        principalAmount: data.amount,
        totalRepayable: data.amount,
        outstandingAmount: data.amount,
        installmentAmount: data.installmentAmount,
        status: 'REQUESTED',
      },
    });
  }

  async submitReimbursement(userId: string, data: any) {
    const employee = await this.db.employee.findUnique({ where: { userId } });
    if (!employee) throw new NotFoundException('Employee not found');

    return this.db.employeeReimbursement.create({
      data: {
        employeeId: employee.id,
        type: data.type,
        amount: data.amount,
        reason: data.reason,
        date: new Date(data.date),
        receiptUrl: data.receiptUrl,
        status: 'SUBMITTED',
      },
    });
  }

  async getMyInfo(userId: string) {
    return this.db.employee.findUnique({
      where: { userId },
      include: {
        loans: true,
        reimbursements: true,
        payrollResults: { include: { period: true }, take: 6, orderBy: { createdAt: 'desc' } },
      },
    });
  }
}
