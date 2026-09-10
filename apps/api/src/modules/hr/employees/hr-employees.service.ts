import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { EmploymentStatus } from '@prisma/client';

@Injectable()
export class HrEmployeesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async onboard(organizationId: string, data: any, actorId: string) {
    const employeeNumber = await this.generateEmployeeNumber(organizationId);

    const employee = await this.db.employee.create({
      data: {
        employeeId: employeeNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        dateOfJoin: new Date(data.dateOfJoin),
        designation: data.designationName,
        designationId: data.designationId,
        departmentId: data.departmentId,
        schoolId: data.schoolId,
        employmentStatus: EmploymentStatus.ONBOARDING,
      },
      include: { department: true, currentDesignation: true },
    });

    await this.audit.log({
      action: 'hr.employee.onboard',
      resource: 'Employee',
      resourceId: employee.id,
      actorId,
      organizationId,
    });

    return employee;
  }

  private async generateEmployeeNumber(organizationId: string): Promise<string> {
    const count = await this.db.employee.count({
      where: { school: { organizationId } },
    });
    return `EMP-${(count + 1).toString().padStart(6, '0')}`;
  }

  async findAll(organizationId: string, filters: any) {
    return this.db.employee.findMany({
      where: {
        school: { organizationId },
        schoolId: filters.schoolId,
        departmentId: filters.departmentId,
        employmentStatus: filters.status,
      },
      include: { department: true, currentDesignation: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProfile(organizationId: string, id: string) {
    const employee = await this.db.employee.findFirst({
      where: { id, school: { organizationId } },
      include: {
        department: true,
        currentDesignation: true,
        contracts: true,
        salaryAssignments: { include: { structure: { include: { components: true } } } },
        attendanceRecords: { take: 10, orderBy: { date: 'desc' } },
        leaveRequests: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async updateStatus(organizationId: string, id: string, status: EmploymentStatus, actorId: string) {
    const updated = await this.db.employee.update({
      where: { id },
      data: { employmentStatus: status },
    });

    await this.audit.log({
      action: 'hr.employee.status_update',
      resource: 'Employee',
      resourceId: id,
      actorId,
      organizationId,
      metadata: { status },
    });

    return updated;
  }
}
