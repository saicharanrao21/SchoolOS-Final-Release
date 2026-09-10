import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export interface NumberSequenceConfig {
  organizationId: string;
  schoolId?: string;
  entityType: string;
  prefix?: string;
  suffix?: string;
  padding?: number;
  resetPolicy?: 'NEVER' | 'YEARLY' | 'MONTHLY';
}

@Injectable()
export class NumberingService {
  private readonly logger = new Logger(NumberingService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Generates the next document/entity identifier using atomic concurrency-safe increment
   */
  async generateNextNumber(
    organizationId: string,
    entityType: string,
    schoolId?: string,
  ): Promise<string> {
    return this.db.$transaction(async (tx) => {
      let seq = await tx.numberSequence.findFirst({
        where: {
          organizationId,
          schoolId: schoolId || null,
          entityType,
        },
      });

      if (!seq) {
        // Create default sequence
        const defaultPrefix = this.getDefaultPrefix(entityType);
        seq = await tx.numberSequence.create({
          data: {
            organizationId,
            schoolId: schoolId || null,
            entityType,
            prefix: defaultPrefix,
            nextNumber: 1,
            padding: 5,
            resetPolicy: 'NEVER',
          },
        });
      }

      // Check reset policy
      const now = new Date();
      let currentNextNumber = seq.nextNumber;

      if (seq.resetPolicy === 'YEARLY' && seq.lastResetAt) {
        if (seq.lastResetAt.getFullYear() !== now.getFullYear()) {
          currentNextNumber = 1;
        }
      }

      const formattedNumber = String(currentNextNumber).padStart(seq.padding, '0');
      const generated = `${seq.prefix || ''}${formattedNumber}${seq.suffix || ''}`;

      // Atomic increment
      await tx.numberSequence.update({
        where: { id: seq.id },
        data: {
          nextNumber: currentNextNumber + 1,
          lastResetAt: now,
        },
      });

      return generated;
    });
  }

  async configureSequence(config: NumberSequenceConfig) {
    return this.db.numberSequence.upsert({
      where: {
        organizationId_schoolId_entityType: {
          organizationId: config.organizationId,
          schoolId: config.schoolId || null as any,
          entityType: config.entityType,
        },
      },
      create: {
        organizationId: config.organizationId,
        schoolId: config.schoolId || null,
        entityType: config.entityType,
        prefix: config.prefix || this.getDefaultPrefix(config.entityType),
        suffix: config.suffix || '',
        padding: config.padding || 5,
        resetPolicy: config.resetPolicy || 'NEVER',
        nextNumber: 1,
      },
      update: {
        prefix: config.prefix,
        suffix: config.suffix,
        padding: config.padding,
        resetPolicy: config.resetPolicy,
      },
    });
  }

  async getSequences(organizationId: string, schoolId?: string) {
    return this.db.numberSequence.findMany({
      where: {
        organizationId,
        ...(schoolId ? { schoolId } : {}),
      },
      orderBy: { entityType: 'asc' },
    });
  }

  private getDefaultPrefix(entityType: string): string {
    const year = new Date().getFullYear();
    switch (entityType.toUpperCase()) {
      case 'STUDENT_ADMISSION':
        return `ADM-${year}-`;
      case 'INVOICE':
        return `INV-${year}-`;
      case 'RECEIPT':
        return `RCP-${year}-`;
      case 'EMPLOYEE_ID':
        return `EMP-${year}-`;
      case 'PURCHASE_ORDER':
        return `PO-${year}-`;
      case 'CERTIFICATE':
        return `CRT-${year}-`;
      default:
        return `DOC-${year}-`;
    }
  }
}
