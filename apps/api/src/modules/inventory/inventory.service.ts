import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';
import { StockMovementType, Prisma } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async createItem(organizationId: string, data: any, actorId: string) {
    const itemCode = await this.generateItemCode(organizationId);

    const item = await this.db.inventoryItem.create({
      data: {
        code: itemCode,
        sku: data.sku,
        name: data.name,
        description: data.description,
        type: data.type,
        schoolId: data.schoolId,
        categoryId: data.categoryId,
        unit: data.unit || 'Nos',
        barcode: data.barcode,
        minStock: data.minStock || 0,
        reorderLevel: data.reorderLevel || 0,
      },
    });

    await this.audit.log({
      action: 'inventory.item.create',
      resource: 'InventoryItem',
      resourceId: item.id,
      actorId,
      organizationId,
    });

    return item;
  }

  private async generateItemCode(organizationId: string): Promise<string> {
    const count = await this.db.inventoryItem.count({
      where: { school: { organizationId } },
    });
    return `INV-${(count + 1).toString().padStart(6, '0')}`;
  }

  async recordMovement(organizationId: string, data: any, actorId: string) {
    return this.db.$transaction(async (tx) => {
      const movement = await tx.stockMovement.create({
        data: {
          itemId: data.itemId,
          type: data.type as StockMovementType,
          quantity: data.quantity,
          sourceWarehouseId: data.sourceWarehouseId,
          destWarehouseId: data.destWarehouseId,
          referenceType: data.referenceType,
          referenceId: data.referenceId,
          actorId,
          reason: data.reason,
        },
      });

      if (data.destWarehouseId) {
        await tx.inventoryItemStock.upsert({
          where: { itemId_warehouseId: { itemId: data.itemId, warehouseId: data.destWarehouseId } },
          update: { quantity: { increment: data.quantity } },
          create: { itemId: data.itemId, warehouseId: data.destWarehouseId, quantity: data.quantity },
        });
      }

      if (data.sourceWarehouseId) {
        const sourceStock = await tx.inventoryItemStock.findUnique({
          where: { itemId_warehouseId: { itemId: data.itemId, warehouseId: data.sourceWarehouseId } },
        });

        if (!sourceStock || sourceStock.quantity < data.quantity) {
          throw new BadRequestException('Insufficient stock in source warehouse');
        }

        await tx.inventoryItemStock.update({
          where: { id: sourceStock.id },
          data: { quantity: { decrement: data.quantity } },
        });
      }

      return movement;
    });
  }

  async getDashboard(organizationId: string, schoolId: string) {
    const items = await this.db.inventoryItem.findMany({
      where: { schoolId },
      include: { stocks: true }
    });

    const lowStockCount = items.filter(item => {
      const totalStock = item.stocks.reduce((sum, s) => sum + s.quantity, 0);
      return totalStock <= item.reorderLevel;
    }).length;

    const totalQuantity = await this.db.inventoryItemStock.aggregate({
      where: { warehouse: { schoolId } },
      _sum: { quantity: true }
    });

    return {
      totalItems: items.length,
      lowStockItems: lowStockCount,
      totalQuantity: totalQuantity._sum.quantity || 0
    };
  }

  async findAllItems(schoolId: string) {
    return this.db.inventoryItem.findMany({
      where: { schoolId },
      include: { category: true, stocks: { include: { warehouse: true } } },
    });
  }
}
