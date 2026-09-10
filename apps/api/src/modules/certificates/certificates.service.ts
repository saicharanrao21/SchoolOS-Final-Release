import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';
import { CertificateStatus } from '@prisma/client';
import { nanoid } from 'nanoid';

@Injectable()
export class CertificatesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async createTemplate(organizationId: string, data: any, actorId: string) {
    const template = await this.db.certificateTemplate.create({
      data: {
        name: data.name,
        title: data.title,
        body: data.body,
        styles: data.styles,
        schoolId: data.schoolId,
      },
    });

    await this.audit.log({
      action: 'certificate.template.create',
      resource: 'CertificateTemplate',
      resourceId: template.id,
      actorId,
      organizationId,
    });

    return template;
  }

  async issueCertificate(organizationId: string, data: any, actorId: string) {
    const certificateNumber = await this.generateCertificateNumber(organizationId);
    const verificationToken = nanoid(16);

    const certificate = await this.db.certificateIssue.create({
      data: {
        certificateNumber,
        templateId: data.templateId,
        recipientId: data.recipientId,
        recipientType: data.recipientType,
        data: data.variables,
        verificationToken,
        organizationId,
        schoolId: data.schoolId,
        status: CertificateStatus.ISSUED,
      },
    });

    await this.audit.log({
      action: 'certificate.issue',
      resource: 'CertificateIssue',
      resourceId: certificate.id,
      actorId,
      organizationId,
    });

    return certificate;
  }

  private async generateCertificateNumber(organizationId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.db.certificateIssue.count({
      where: { organizationId, createdAt: { gte: new Date(year, 0, 1) } },
    });
    return `CERT-${year}-${(count + 1).toString().padStart(6, '0')}`;
  }

  async verifyCertificate(token: string) {
    const cert = await this.db.certificateIssue.findUnique({
      where: { verificationToken: token },
      include: { template: true, school: true },
    });

    if (!cert) throw new NotFoundException('Certificate not found');

    return {
      certificateNumber: cert.certificateNumber,
      status: cert.status,
      issueDate: cert.issueDate,
      school: cert.school.name,
      template: cert.template.name,
      revokedAt: cert.revokedAt,
    };
  }

  async revokeCertificate(organizationId: string, id: string, reason: string, actorId: string) {
    const updated = await this.db.certificateIssue.update({
      where: { id },
      data: {
        status: CertificateStatus.REVOKED,
        revokedAt: new Date(),
        revokedById: actorId,
      },
    });

    await this.audit.log({
      action: 'certificate.revoke',
      resource: 'CertificateIssue',
      resourceId: id,
      actorId,
      organizationId,
      metadata: { reason },
    });

    return updated;
  }

  async findByRecipient(recipientId: string) {
    return this.db.certificateIssue.findMany({
      where: { recipientId, status: CertificateStatus.ISSUED },
      include: { template: true },
    });
  }
}
