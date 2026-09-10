import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';
import { DocumentStatus, VerificationStatus, ConfidentialityLevel } from '@prisma/client';

@Injectable()
export class DmsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async uploadDocument(organizationId: string, data: any, actorId: string) {
    const document = await this.db.dmsDocument.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        type: data.type,
        ownerId: data.ownerId,
        ownerType: data.ownerType,
        originalFilename: data.originalFilename,
        mimeType: data.mimeType,
        fileSize: data.fileSize,
        storagePath: data.storagePath,
        checksum: data.checksum,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        issueDate: data.issueDate ? new Date(data.issueDate) : null,
        issuingAuthority: data.issuingAuthority,
        confidentiality: data.confidentiality || ConfidentialityLevel.INTERNAL,
        organizationId,
        schoolId: data.schoolId,
        uploadedById: actorId,
        status: DocumentStatus.ACTIVE,
        verificationStatus: VerificationStatus.UPLOADED,
      },
    });

    await this.audit.log({
      action: 'dms.document.upload',
      resource: 'DmsDocument',
      resourceId: document.id,
      actorId,
      organizationId,
    });

    return document;
  }

  async verifyDocument(organizationId: string, id: string, status: VerificationStatus, actorId: string) {
    const updated = await this.db.dmsDocument.update({
      where: { id },
      data: {
        verificationStatus: status,
        verifiedById: actorId,
        verifiedAt: new Date(),
      },
    });

    await this.audit.log({
      action: `dms.document.${status.toLowerCase()}`,
      resource: 'DmsDocument',
      resourceId: id,
      actorId,
      organizationId,
    });

    return updated;
  }

  async createVersion(organizationId: string, documentId: string, data: any, actorId: string) {
    return this.db.$transaction(async (tx) => {
      const doc = await tx.dmsDocument.findUnique({ where: { id: documentId }, include: { versions: true } });
      if (!doc) throw new NotFoundException('Document not found');

      const nextVersion = doc.versions.length + 1;

      const version = await tx.documentVersion.create({
        data: {
          documentId,
          version: nextVersion,
          storagePath: data.storagePath,
          checksum: data.checksum,
          uploadedById: actorId,
          reason: data.reason,
        },
      });

      await tx.dmsDocument.update({
        where: { id: documentId },
        data: {
          storagePath: data.storagePath,
          checksum: data.checksum,
          updatedAt: new Date(),
        },
      });

      return version;
    });
  }

  async findByOwner(ownerId: string, ownerType: string) {
    return this.db.dmsDocument.findMany({
      where: { ownerId, ownerType, status: { not: DocumentStatus.DELETED } },
      include: { uploadedBy: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getExpiringDocuments(schoolId: string, days: number) {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + days);

    return this.db.dmsDocument.findMany({
      where: {
        schoolId,
        expiryDate: { lte: threshold, gte: new Date() },
        status: DocumentStatus.ACTIVE,
      },
      include: { school: true },
    });
  }
}
