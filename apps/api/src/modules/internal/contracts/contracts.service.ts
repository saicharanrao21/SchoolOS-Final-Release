import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { CompanyContractStatus, Prisma } from '@prisma/client';

@Injectable()
export class CompanyContractsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async createContract(organizationId: string, data: any, actorId: string) {
    const year = new Date().getFullYear();
    const count = await this.db.companyContract.count({ where: { organizationId } });
    const contractNumber = `CTR-${year}-${(count + 1).toString().padStart(6, '0')}`;

    const contract = await this.db.companyContract.create({
      data: {
        contractNumber,
        title: data.title,
        type: data.type || 'SERVICE_LEVEL',
        vendorId: data.vendorId,
        value: new Prisma.Decimal(data.value || 0),
        currency: data.currency || 'USD',
        effectiveDate: new Date(data.effectiveDate),
        expiryDate: new Date(data.expiryDate),
        renewalDate: data.renewalDate ? new Date(data.renewalDate) : null,
        autoRenewal: data.autoRenewal === true,
        status: CompanyContractStatus.ACTIVE,
        fileUrl: data.fileUrl,
        ownerId: actorId,
        organizationId,
      },
    });

    await this.audit.log({
      action: 'internal.contract.create',
      resource: 'CompanyContract',
      resourceId: contract.id,
      actorId,
      organizationId,
    });

    return contract;
  }

  async getContracts(organizationId: string) {
    return this.db.companyContract.findMany({
      where: { organizationId },
      include: {
        vendor: true,
        owner: { select: { firstName: true, lastName: true } },
      },
      orderBy: { expiryDate: 'asc' },
    });
  }

  async getExpiringContracts(organizationId: string, days: number = 30) {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + days);

    return this.db.companyContract.findMany({
      where: {
        organizationId,
        expiryDate: { lte: threshold, gte: new Date() },
        status: CompanyContractStatus.ACTIVE,
      },
      include: { vendor: true },
    });
  }
}
