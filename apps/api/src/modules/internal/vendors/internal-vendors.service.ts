import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { InternalVendorStatus, Prisma } from '@prisma/client';

@Injectable()
export class InternalVendorsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async createVendor(organizationId: string, data: any, actorId: string) {
    const count = await this.db.internalVendor.count({ where: { organizationId } });
    const code = `VND-${(count + 1).toString().padStart(6, '0')}`;

    const vendor = await this.db.internalVendor.create({
      data: {
        code,
        companyName: data.companyName,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        address: data.address,
        taxId: data.taxId,
        category: data.category,
        status: InternalVendorStatus.ACTIVE,
        bankDetails: data.bankDetails,
        contractStartDate: data.contractStartDate ? new Date(data.contractStartDate) : null,
        contractEndDate: data.contractEndDate ? new Date(data.contractEndDate) : null,
        outstandingAmount: new Prisma.Decimal(data.outstandingAmount || 0),
        organizationId,
      },
    });

    await this.audit.log({
      action: 'internal.vendor.create',
      resource: 'InternalVendor',
      resourceId: vendor.id,
      actorId,
      organizationId,
    });

    return vendor;
  }

  async getVendors(organizationId: string) {
    return this.db.internalVendor.findMany({
      where: { organizationId },
      include: { contracts: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
