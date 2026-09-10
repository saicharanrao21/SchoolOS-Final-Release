import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AttendancePoliciesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async create(organizationId: string, data: any, actorId: string) {
    const policy = await this.db.attendancePolicy.create({
      data: {
        name: data.name,
        role: data.role,
        mode: data.mode,
        lateThresholdMins: data.lateThresholdMins,
        halfDayThresholdHrs: data.halfDayThresholdHrs,
        requireApproval: data.requireApproval || false,
        schoolId: data.schoolId,
      },
    });

    await this.audit.log({
      action: 'attendance.policy.create',
      resource: 'AttendancePolicy',
      resourceId: policy.id,
      actorId,
      organizationId,
      schoolId: data.schoolId,
    });

    return policy;
  }

  async findAll(organizationId: string, schoolId: string) {
    return this.db.attendancePolicy.findMany({
      where: {
        schoolId,
        school: { organizationId },
        isActive: true,
      },
    });
  }
}
