import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';
import { AssetStatus } from '@prisma/client';

@Injectable()
export class AssetsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async createAsset(organizationId: string, data: any, actorId: string) {
    const assetTag = await this.generateAssetTag(organizationId);

    const asset = await this.db.asset.create({
      data: {
        assetTag,
        name: data.name,
        serialNumber: data.serialNumber,
        categoryId: data.categoryId,
        schoolId: data.schoolId,
        purchaseDate: new Date(data.purchaseDate),
        purchaseCost: data.purchaseCost,
        vendorId: data.vendorId,
        location: data.location,
        condition: data.condition || 'NEW',
        status: AssetStatus.IN_STOCK,
      },
    });

    await this.audit.log({
      action: 'asset.create',
      resource: 'Asset',
      resourceId: asset.id,
      actorId,
      organizationId,
    });

    return asset;
  }

  private async generateAssetTag(organizationId: string): Promise<string> {
    const count = await this.db.asset.count({
      where: { school: { organizationId } },
    });
    return `AST-${(count + 1).toString().padStart(6, '0')}`;
  }

  async assignAsset(organizationId: string, data: any, actorId: string) {
    return this.db.$transaction(async (tx) => {
      // Deactivate current assignment if any
      await tx.assetAssignment.updateMany({
        where: { assetId: data.assetId, isActive: true },
        data: { isActive: false, returnDate: new Date() },
      });

      const assignment = await tx.assetAssignment.create({
        data: {
          assetId: data.assetId,
          assigneeId: data.assigneeId,
          location: data.location,
          assignedDate: new Date(),
          isActive: true,
        },
      });

      await tx.asset.update({
        where: { id: data.assetId },
        data: { status: AssetStatus.ASSIGNED, custodianId: data.assigneeId, location: data.location },
      });

      return assignment;
    });
  }

  async recordMaintenance(organizationId: string, data: any, actorId: string) {
    const maintenance = await this.db.assetMaintenance.create({
      data: {
        assetId: data.assetId,
        type: data.type,
        date: new Date(data.date),
        description: data.description,
        cost: data.cost,
        vendor: data.vendor,
        performedById: actorId,
      },
    });

    return maintenance;
  }

  async getDashboard(organizationId: string, schoolId: string) {
    const [total, assigned, repair] = await Promise.all([
      this.db.asset.count({ where: { schoolId } }),
      this.db.asset.count({ where: { schoolId, status: AssetStatus.ASSIGNED } }),
      this.db.asset.count({ where: { schoolId, status: AssetStatus.IN_REPAIR } }),
    ]);

    return { totalAssets: total, assignedAssets: assigned, inRepair: repair };
  }

  async findAllAssets(schoolId: string) {
    return this.db.asset.findMany({
      where: { schoolId },
      include: { category: true, assignments: { where: { isActive: true } } },
    });
  }
}
