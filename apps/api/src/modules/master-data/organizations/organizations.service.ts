import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { Prisma } from '@prisma/client';
import { AuditService } from '../../../audit/audit.service';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async create(data: Prisma.OrganizationCreateInput, actorId?: string) {
    const org = await this.db.organization.create({ data });
    await this.audit.log({
      action: 'organization.create',
      resource: 'Organization',
      resourceId: org.id,
      actorId,
      organizationId: org.id,
      metadata: { name: org.name },
    });
    return org;
  }

  async findAll() {
    return this.db.organization.findMany({
      where: { isActive: true },
    });
  }

  async findOne(id: string) {
    const org = await this.db.organization.findUnique({
      where: { id },
      include: { schools: true },
    });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async update(id: string, data: Prisma.OrganizationUpdateInput, actorId?: string) {
    const org = await this.db.organization.update({
      where: { id },
      data,
    });
    await this.audit.log({
      action: 'organization.update',
      resource: 'Organization',
      resourceId: org.id,
      actorId,
      organizationId: org.id,
    });
    return org;
  }

  async remove(id: string, actorId?: string) {
    const org = await this.db.organization.update({
      where: { id },
      data: { isActive: false },
    });
    await this.audit.log({
      action: 'organization.archive',
      resource: 'Organization',
      resourceId: org.id,
      actorId,
      organizationId: org.id,
    });
    return org;
  }
}
