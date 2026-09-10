import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { Prisma } from '@prisma/client';
import { AuditService } from '../../../audit/audit.service';

@Injectable()
export class FeeCategoriesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async create(organizationId: string, data: any, actorId: string) {
    const school = await this.db.school.findFirst({
      where: { id: data.schoolId, organizationId },
    });
    if (!school) throw new NotFoundException('School not found');

    const category = await this.db.feeCategory.create({
      data: {
        name: data.name,
        description: data.description,
        school: { connect: { id: data.schoolId } },
      },
    });

    await this.audit.log({
      action: 'fee.category.create',
      resource: 'FeeCategory',
      resourceId: category.id,
      actorId,
      organizationId,
      schoolId: school.id,
      metadata: { name: category.name },
    });

    return category;
  }

  async findAll(organizationId: string, schoolId: string) {
    return this.db.feeCategory.findMany({
      where: {
        schoolId,
        school: { organizationId },
      },
      orderBy: { name: 'asc' },
    });
  }
}
