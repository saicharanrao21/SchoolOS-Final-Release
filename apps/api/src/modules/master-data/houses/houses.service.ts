import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { Prisma } from '@prisma/client';
import { AuditService } from '../../../audit/audit.service';

@Injectable()
export class HousesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async create(organizationId: string, data: any, actorId?: string) {
    const school = await this.db.school.findFirst({
      where: { id: data.schoolId, organizationId },
    });
    if (!school) throw new NotFoundException('School not found');

    const house = await this.db.house.create({
      data: {
        name: data.name,
        code: data.code,
        color: data.color,
        school: { connect: { id: data.schoolId } },
      },
    });

    await this.audit.log({
      action: 'house.create',
      resource: 'House',
      resourceId: house.id,
      actorId,
      organizationId,
      schoolId: data.schoolId,
    });

    return house;
  }

  async findAll(organizationId: string, schoolId?: string) {
    return this.db.house.findMany({
      where: {
        schoolId,
        school: { organizationId },
        isActive: true,
      },
      include: { school: true },
    });
  }

  async findOne(organizationId: string, id: string) {
    const house = await this.db.house.findFirst({
      where: { id, school: { organizationId } },
      include: { school: true },
    });
    if (!house) throw new NotFoundException('House not found');
    return house;
  }

  async update(organizationId: string, id: string, data: Prisma.HouseUpdateInput, actorId?: string) {
    const house = await this.findOne(organizationId, id);
    const updated = await this.db.house.update({
      where: { id },
      data,
    });
    await this.audit.log({
      action: 'house.update',
      resource: 'House',
      resourceId: id,
      actorId,
      organizationId,
      schoolId: house.schoolId,
    });
    return updated;
  }

  async remove(organizationId: string, id: string, actorId?: string) {
    const house = await this.findOne(organizationId, id);
    const updated = await this.db.house.update({
      where: { id },
      data: { isActive: false },
    });
    await this.audit.log({
      action: 'house.archive',
      resource: 'House',
      resourceId: id,
      actorId,
      organizationId,
      schoolId: house.schoolId,
    });
    return updated;
  }
}
