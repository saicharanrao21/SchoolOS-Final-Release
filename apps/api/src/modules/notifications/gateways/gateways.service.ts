import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { NotificationChannel } from '@prisma/client';
import { GATEWAY_PROVIDER_CATALOG, GatewayProvider } from './provider-catalog';

const ENCRYPTED_PREFIX = 'v1:';

@Injectable()
export class NotificationGatewaysService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  catalog(channel?: NotificationChannel): GatewayProvider[] {
    return channel
      ? GATEWAY_PROVIDER_CATALOG.filter((provider) => provider.channels.includes(channel))
      : GATEWAY_PROVIDER_CATALOG;
  }

  async list(organizationId: string, schoolId: string, channel?: NotificationChannel) {
    const providers = await this.db.notificationProvider.findMany({
      where: { schoolId, school: { organizationId }, ...(channel ? { channel } : {}) },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });

    return providers.map((provider) => ({
      id: provider.id,
      name: provider.name,
      channel: provider.channel,
      schoolId: provider.schoolId,
      isActive: provider.isActive,
      isDefault: provider.isDefault,
      createdAt: provider.createdAt,
      updatedAt: provider.updatedAt,
      config: this.maskConfig(provider.config),
    }));
  }

  async create(
    organizationId: string,
    schoolId: string,
    actorId: string,
    data: { providerKey: string; channel: NotificationChannel; config: Record<string, unknown>; isDefault?: boolean },
  ) {
    const catalogEntry = this.findCatalogEntry(data.providerKey, data.channel);
    this.assertConfigFields(catalogEntry, data.config);

    const encryptedConfig = this.encryptConfig(data.config);
    const provider = await this.db.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.notificationProvider.updateMany({
          where: { schoolId, channel: data.channel, school: { organizationId } },
          data: { isDefault: false },
        });
      }

      return tx.notificationProvider.create({
        data: {
          name: catalogEntry.key,
          channel: data.channel,
          config: encryptedConfig,
          schoolId,
          isDefault: data.isDefault ?? false,
          isActive: true,
        },
      });
    });

    await this.audit.log({
      action: 'notifications.gateway.create',
      resource: 'NotificationProvider',
      resourceId: provider.id,
      actorId,
      organizationId,
      schoolId,
      metadata: { provider: catalogEntry.key, channel: data.channel },
    });

    return {
      id: provider.id,
      name: provider.name,
      channel: provider.channel,
      isDefault: provider.isDefault,
      isActive: provider.isActive,
      config: this.maskConfig(provider.config),
    };
  }

  async update(
    organizationId: string,
    schoolId: string,
    actorId: string,
    id: string,
    data: { providerKey?: string; channel?: NotificationChannel; config?: Record<string, unknown>; isActive?: boolean; isDefault?: boolean },
  ) {
    const existing = await this.db.notificationProvider.findFirst({
      where: { id, schoolId, school: { organizationId } },
    });
    if (!existing) throw new NotFoundException('Notification gateway not found');

    const channel = data.channel ?? existing.channel;
    const providerKey = data.providerKey ?? existing.name;
    const catalogEntry = this.findCatalogEntry(providerKey, channel);
    if (data.config) this.assertConfigFields(catalogEntry, data.config);

    const updated = await this.db.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.notificationProvider.updateMany({
          where: { schoolId, channel, school: { organizationId }, NOT: { id } },
          data: { isDefault: false },
        });
      }

      return tx.notificationProvider.update({
        where: { id },
        data: {
          name: catalogEntry.key,
          channel,
          ...(data.config ? { config: this.encryptConfig(data.config) } : {}),
          ...(data.isActive === undefined ? {} : { isActive: data.isActive }),
          ...(data.isDefault === undefined ? {} : { isDefault: data.isDefault }),
        },
      });
    });

    await this.audit.log({
      action: 'notifications.gateway.update',
      resource: 'NotificationProvider',
      resourceId: id,
      actorId,
      organizationId,
      schoolId,
      metadata: { provider: catalogEntry.key, channel },
    });

    return {
      id: updated.id,
      name: updated.name,
      channel: updated.channel,
      isDefault: updated.isDefault,
      isActive: updated.isActive,
      config: this.maskConfig(updated.config),
    };
  }

  async remove(organizationId: string, schoolId: string, actorId: string, id: string) {
    const existing = await this.db.notificationProvider.findFirst({
      where: { id, schoolId, school: { organizationId } },
    });
    if (!existing) throw new NotFoundException('Notification gateway not found');

    await this.db.notificationProvider.delete({ where: { id } });
    await this.audit.log({
      action: 'notifications.gateway.delete',
      resource: 'NotificationProvider',
      resourceId: id,
      actorId,
      organizationId,
      schoolId,
      metadata: { provider: existing.name, channel: existing.channel },
    });
    return { success: true };
  }

  async resolveDefault(schoolId: string, channel: NotificationChannel) {
    const provider = await this.db.notificationProvider.findFirst({
      where: { schoolId, channel, isActive: true, isDefault: true },
      orderBy: { updatedAt: 'desc' },
    });
    if (!provider) return null;

    return {
      id: provider.id,
      name: provider.name,
      channel: provider.channel,
      config: this.decryptConfig(provider.config),
    };
  }

  async setDefault(organizationId: string, schoolId: string, actorId: string, id: string) {
    const existing = await this.db.notificationProvider.findFirst({
      where: { id, schoolId, school: { organizationId } },
    });
    if (!existing) throw new NotFoundException('Notification gateway not found');
    if (!existing.isActive) throw new BadRequestException('An inactive gateway cannot be the default');

    await this.db.$transaction([
      this.db.notificationProvider.updateMany({
        where: { schoolId, channel: existing.channel, school: { organizationId } },
        data: { isDefault: false },
      }),
      this.db.notificationProvider.update({ where: { id }, data: { isDefault: true } }),
    ]);

    await this.audit.log({
      action: 'notifications.gateway.default',
      resource: 'NotificationProvider',
      resourceId: id,
      actorId,
      organizationId,
      schoolId,
      metadata: { provider: existing.name, channel: existing.channel },
    });
    return { success: true, id };
  }

  async inspect(organizationId: string, schoolId: string, id: string) {
    const provider = await this.db.notificationProvider.findFirst({
      where: { id, schoolId, school: { organizationId } },
    });
    if (!provider) throw new NotFoundException('Notification gateway not found');

    return {
      ...provider,
      config: this.maskConfig(provider.config),
      catalog: GATEWAY_PROVIDER_CATALOG.find((entry) => entry.key === provider.name) ?? null,
    };
  }

  private findCatalogEntry(providerKey: string, channel: NotificationChannel) {
    const entry = GATEWAY_PROVIDER_CATALOG.find(
      (candidate) => candidate.key === providerKey && candidate.channels.includes(channel),
    );
    if (!entry) {
      throw new BadRequestException(`Provider ${providerKey} does not support ${channel}`);
    }
    return entry;
  }

  private assertConfigFields(provider: GatewayProvider, config: Record<string, unknown>) {
    for (const field of provider.configFields) {
      if (config[field] === undefined || config[field] === null || String(config[field]).trim() === '') {
        throw new BadRequestException(`Missing gateway configuration field: ${field}`);
      }
    }
  }

  private decryptConfig(value: unknown): Record<string, any> {
    if (typeof value !== 'string' || !value.startsWith(ENCRYPTED_PREFIX)) return {};
    const encoded = value.slice(ENCRYPTED_PREFIX.length);
    const [ivHex, tagHex, cipherHex] = encoded.split(':');
    if (!ivHex || !tagHex || !cipherHex) return {};
    const decipher = createDecipheriv('aes-256-gcm', this.encryptionKey(), Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    const plaintext = Buffer.concat([decipher.update(Buffer.from(cipherHex, 'hex')), decipher.final()]);
    return JSON.parse(plaintext.toString('utf8'));
  }

  private encryptionKey() {
    const raw = process.env.NOTIFICATION_CONFIG_ENCRYPTION_KEY;
    if (!raw) {
      throw new BadRequestException('NOTIFICATION_CONFIG_ENCRYPTION_KEY is required to store gateway credentials');
    }
    return createHash('sha256').update(raw).digest();
  }

  private encryptConfig(config: Record<string, unknown>) {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey(), iv);
    const encrypted = Buffer.concat([cipher.update(JSON.stringify(config), 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${ENCRYPTED_PREFIX}${iv.toString('base64')}.${tag.toString('base64')}.${encrypted.toString('base64')}`;
  }

  private maskConfig(config: unknown) {
    if (typeof config !== 'string' || !config.startsWith(ENCRYPTED_PREFIX)) return { configured: true };
    return { configured: true, encrypted: true };
  }
}
