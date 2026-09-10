import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';

@Injectable()
export class LeaveBalancesService {
  constructor(private readonly db: DatabaseService) {}

  async findByEmployee(employeeId: string, academicYearId: string) {
    return this.db.leaveBalance.findMany({
      where: { employeeId, academicYearId },
      include: { leaveType: true },
    });
  }

  async updateBalance(data: any) {
    return this.db.leaveBalance.upsert({
      where: {
        employeeId_leaveTypeId_academicYearId: {
          employeeId: data.employeeId,
          leaveTypeId: data.leaveTypeId,
          academicYearId: data.academicYearId,
        },
      },
      update: { allocated: data.allocated },
      create: {
        employeeId: data.employeeId,
        leaveTypeId: data.leaveTypeId,
        academicYearId: data.academicYearId,
        allocated: data.allocated,
      },
    });
  }
}
