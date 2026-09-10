import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { Prisma } from '@prisma/client';
import { AuditService } from '../../../audit/audit.service';

@Injectable()
export class CampusesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async create(organizationId: string, data: any, actorId?: string) {
    const school = await this.db.school.findFirst({
      where: { id: data.schoolId, organizationId },
    });
    if (!school) throw new NotFoundException('School not found');

    const campus = await this.db.campus.create({
      data: {
        name: data.name,
        code: data.code,
        address: data.address,
        phone: data.phone,
        email: data.email,
        capacity: data.capacity,
        school: { connect: { id: data.schoolId } },
      },
    });

    await this.audit.log({
      action: 'campus.create',
      resource: 'Campus',
      resourceId: campus.id,
      actorId,
      organizationId,
      schoolId: data.schoolId,
      campusId: campus.id,
    });

    return campus;
  }

  async findAll(organizationId: string) {
    return this.db.campus.findMany({
      where: {
        school: { organizationId },
        isActive: true,
      },
      include: { school: true },
    });
  }

  async findOne(organizationId: string, id: string) {
    const campus = await this.db.campus.findFirst({
      where: { id, school: { organizationId } },
      include: { school: true, locations: true },
    });
    if (!campus) throw new NotFoundException('Campus not found');
    return campus;
  }

  async update(organizationId: string, id: string, data: Prisma.CampusUpdateInput, actorId?: string) {
    const campus = await this.findOne(organizationId, id);
    const updated = await this.db.campus.update({
      where: { id },
      data,
    });
    await this.audit.log({
      action: 'campus.update',
      resource: 'Campus',
      resourceId: id,
      actorId,
      organizationId,
      schoolId: campus.schoolId,
      campusId: id,
    });
    return updated;
  }

  async remove(organizationId: string, id: string, actorId?: string) {
    const campus = await this.findOne(organizationId, id);
    const updated = await this.db.campus.update({
      where: { id },
      data: { isActive: false },
    });
    await this.audit.log({
      action: 'campus.archive',
      resource: 'Campus',
      resourceId: id,
      actorId,
      organizationId,
      schoolId: campus.schoolId,
      campusId: id,
    });
    return updated;
  }
}
