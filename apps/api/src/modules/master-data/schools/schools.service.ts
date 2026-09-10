import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { Prisma } from '@prisma/client';
import { AuditService } from '../../../audit/audit.service';

@Injectable()
export class SchoolsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async create(organizationId: string, data: Omit<Prisma.SchoolCreateInput, 'organization'>, actorId?: string) {
    const school = await this.db.school.create({
      data: {
        ...data,
        organization: { connect: { id: organizationId } },
      },
    });
    await this.audit.log({
      action: 'school.create',
      resource: 'School',
      resourceId: school.id,
      actorId,
      organizationId,
      schoolId: school.id,
    });
    return school;
  }

  async findAll(organizationId: string) {
    return this.db.school.findMany({
      where: { organizationId, isActive: true },
    });
  }

  async findOne(organizationId: string, id: string) {
    const school = await this.db.school.findFirst({
      where: { id, organizationId },
      include: { campuses: true },
    });
    if (!school) throw new NotFoundException('School not found in this organization');
    return school;
  }

  async update(organizationId: string, id: string, data: Prisma.SchoolUpdateInput, actorId?: string) {
    await this.findOne(organizationId, id);
    const school = await this.db.school.update({
      where: { id },
      data,
    });
    await this.audit.log({
      action: 'school.update',
      resource: 'School',
      resourceId: school.id,
      actorId,
      organizationId,
      schoolId: school.id,
    });
    return school;
  }

  async remove(organizationId: string, id: string, actorId?: string) {
    await this.findOne(organizationId, id);
    const school = await this.db.school.update({
      where: { id },
      data: { isActive: false },
    });
    await this.audit.log({
      action: 'school.archive',
      resource: 'School',
      resourceId: school.id,
      actorId,
      organizationId,
      schoolId: school.id,
    });
    return school;
  }
}
