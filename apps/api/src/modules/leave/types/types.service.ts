import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';

@Injectable()
export class LeaveTypesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async create(organizationId: string, data: any, actorId: string) {
    const type = await this.db.leaveType.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        schoolId: data.schoolId,
      },
    });

    await this.audit.log({
      action: 'leave.type.create',
      resource: 'LeaveType',
      resourceId: type.id,
      actorId,
      organizationId,
      schoolId: data.schoolId,
    });

    return type;
  }

  async findAll(organizationId: string, schoolId: string) {
    return this.db.leaveType.findMany({
      where: {
        schoolId,
        school: { organizationId },
        isActive: true,
      },
    });
  }
}
