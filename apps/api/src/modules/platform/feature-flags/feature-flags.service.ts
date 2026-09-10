import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';

@Injectable()
export class PlatformFeatureFlagsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async listFlags() {
    return this.db.platformFeatureFlag.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async upsertFlag(data: any, actorId: string) {
    const flag = await this.db.platformFeatureFlag.upsert({
      where: { key: data.key },
      update: {
        name: data.name,
        description: data.description,
        isEnabled: data.isEnabled,
        targetOrganizations: data.targetOrganizations || [],
        rolloutPercent: data.rolloutPercent ?? 100,
      },
      create: {
        key: data.key,
        name: data.name,
        description: data.description,
        isEnabled: data.isEnabled ?? true,
        targetOrganizations: data.targetOrganizations || [],
        rolloutPercent: data.rolloutPercent ?? 100,
      },
    });

    await this.audit.log({
      action: 'platform.feature_flag.upsert',
      resource: 'PlatformFeatureFlag',
      resourceId: flag.id,
      actorId,
      organizationId: 'SYSTEM',
      metadata: { key: data.key, isEnabled: data.isEnabled },
    });

    return flag;
  }

  async evaluateFlag(key: string, organizationId: string): Promise<boolean> {
    const flag = await this.db.platformFeatureFlag.findUnique({ where: { key } });
    if (!flag || !flag.isEnabled) return false;

    if (flag.targetOrganizations.length > 0) {
      return flag.targetOrganizations.includes(organizationId);
    }

    return true;
  }
}
