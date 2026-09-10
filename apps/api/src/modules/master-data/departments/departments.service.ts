import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { Prisma } from '@prisma/client';
import { AuditService } from '../../../audit/audit.service';

@Injectable()
export class DepartmentsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async create(organizationId: string, data: any, actorId?: string) {
    const school = await this.db.school.findFirst({
      where: { id: data.schoolId, organizationId },
    });
    if (!school) throw new NotFoundException('School not found');

    const department = await this.db.department.create({
      data: {
        name: data.name,
        code: data.code,
        school: { connect: { id: data.schoolId } },
      },
    });

    await this.audit.log({
      action: 'department.create',
      resource: 'Department',
      resourceId: department.id,
      actorId,
      organizationId,
      schoolId: data.schoolId,
    });

    return department;
  }

  async findAll(organizationId: string, schoolId?: string) {
    return this.db.department.findMany({
      where: {
        schoolId,
        school: { organizationId },
        isActive: true,
      },
      include: { school: true },
    });
  }

  async findOne(organizationId: string, id: string) {
    const department = await this.db.department.findFirst({
      where: { id, school: { organizationId } },
      include: { school: true },
    });
    if (!department) throw new NotFoundException('Department not found');
    return department;
  }

  async update(organizationId: string, id: string, data: Prisma.DepartmentUpdateInput, actorId?: string) {
    const dept = await this.findOne(organizationId, id);
    const updated = await this.db.department.update({
      where: { id },
      data,
    });
    await this.audit.log({
      action: 'department.update',
      resource: 'Department',
      resourceId: id,
      actorId,
      organizationId,
      schoolId: dept.schoolId,
    });
    return updated;
  }

  async remove(organizationId: string, id: string, actorId?: string) {
    const dept = await this.findOne(organizationId, id);
    const updated = await this.db.department.update({
      where: { id },
      data: { isActive: false },
    });
    await this.audit.log({
      action: 'department.archive',
      resource: 'Department',
      resourceId: id,
      actorId,
      organizationId,
      schoolId: dept.schoolId,
    });
    return updated;
  }
}
