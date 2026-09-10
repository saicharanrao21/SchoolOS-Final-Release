import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { Prisma } from '@prisma/client';
import { AuditService } from '../../../audit/audit.service';

@Injectable()
export class LocationsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async create(organizationId: string, data: any, actorId?: string) {
    const campus = await this.db.campus.findFirst({
      where: { id: data.campusId, school: { organizationId } },
    });
    if (!campus) throw new NotFoundException('Campus not found');

    const location = await this.db.location.create({
      data: {
        name: data.name,
        code: data.code,
        type: data.type,
        capacity: data.capacity,
        campus: { connect: { id: data.campusId } },
      },
    });

    await this.audit.log({
      action: 'location.create',
      resource: 'Location',
      resourceId: location.id,
      actorId,
      organizationId,
      schoolId: campus.schoolId,
      campusId: campus.id,
    });

    return location;
  }

  async findAll(organizationId: string, campusId?: string) {
    return this.db.location.findMany({
      where: {
        campusId,
        campus: { school: { organizationId } },
        isActive: true,
      },
      include: { campus: { include: { school: true } } },
    });
  }

  async findOne(organizationId: string, id: string) {
    const location = await this.db.location.findFirst({
      where: { id, campus: { school: { organizationId } } },
      include: { campus: { include: { school: true } } },
    });
    if (!location) throw new NotFoundException('Location not found');
    return location;
  }

  async update(organizationId: string, id: string, data: Prisma.LocationUpdateInput, actorId?: string) {
    const loc = await this.findOne(organizationId, id);
    const updated = await this.db.location.update({
      where: { id },
      data,
    });
    await this.audit.log({
      action: 'location.update',
      resource: 'Location',
      resourceId: id,
      actorId,
      organizationId,
      schoolId: loc.campus.schoolId,
      campusId: loc.campusId,
    });
    return updated;
  }

  async remove(organizationId: string, id: string, actorId?: string) {
    const loc = await this.findOne(organizationId, id);
    const updated = await this.db.location.update({
      where: { id },
      data: { isActive: false },
    });
    await this.audit.log({
      action: 'location.archive',
      resource: 'Location',
      resourceId: id,
      actorId,
      organizationId,
      schoolId: loc.campus.schoolId,
      campusId: loc.campusId,
    });
    return updated;
  }
}
