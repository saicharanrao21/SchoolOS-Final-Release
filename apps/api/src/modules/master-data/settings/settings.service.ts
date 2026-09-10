import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { Prisma } from '@prisma/client';
import { AuditService } from '../../../audit/audit.service';

@Injectable()
export class SettingsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async upsert(schoolId: string, category: string, key: string, value: any, actorId?: string) {
    const setting = await this.db.schoolSetting.upsert({
      where: {
        schoolId_category_key: { schoolId, category, key },
      },
      update: { value },
      create: {
        schoolId,
        category,
        key,
        value,
      },
    });

    const school = await this.db.school.findUnique({ where: { id: schoolId } });

    await this.audit.log({
      action: 'setting.update',
      resource: 'SchoolSetting',
      resourceId: setting.id,
      actorId,
      organizationId: school?.organizationId || '',
      schoolId,
      metadata: { category, key, value },
    });

    return setting;
  }

  async findAll(schoolId: string, category?: string) {
    return this.db.schoolSetting.findMany({
      where: {
        schoolId,
        category,
      },
    });
  }
}
