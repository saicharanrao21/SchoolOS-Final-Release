import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class ModuleConfigService {
  constructor(private readonly db: DatabaseService) {}

  async getModuleConfigs(schoolId: string) {
    return this.db.schoolModuleConfig.findMany({
      where: { schoolId },
      orderBy: { moduleKey: 'asc' },
    });
  }

  async setModuleConfig(schoolId: string, moduleKey: string, enabled: boolean, settings?: any) {
    return this.db.schoolModuleConfig.upsert({
      where: {
        schoolId_moduleKey: { schoolId, moduleKey },
      },
      create: {
        schoolId,
        moduleKey,
        enabled,
        settings,
      },
      update: {
        enabled,
        settings,
      },
    });
  }
}
