import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';
import { InventoryService } from '../inventory/inventory.service';
import { PurchaseOrderStatus, PurchaseRequestStatus, StockMovementType } from '@prisma/client';

@Injectable()
export class ProcurementService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
    private readonly inventory: InventoryService,
  ) {}

  private async assertSchool(organizationId: string, schoolId: string) {
    const school = await this.db.school.findFirst({ where: { id: schoolId, organizationId }, select: { id: true } });
    if (!school) throw new ForbiddenException('School is outside the authenticated organization');
    return school;
  }

  async createPurchaseRequest(organizationId: string, data: any, actorId: string) {
    await this.assertSchool(organizationId, data.schoolId);
    const requestNumber = `PR-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    const lines = Array.isArray(data.lines) ? data.lines : [];
    if (!lines.length && !data.description) throw new BadRequestException('Purchase request requires a description or line items');
    const request = await this.db.purchaseRequest.create({
      data: {
        requestNumber,
        requesterId: actorId,
        departmentId: data.departmentId,
        schoolId: data.schoolId,
        description: data.description,
        estimatedCost: data.estimatedCost,
        priority: data.priority || 'NORMAL',
        lines: lines.length ? { create: lines.map((l: any) => ({ itemId: l.itemId || null, description: l.description, quantity: Number(l.quantity), estimatedUnitPrice: l.estimatedUnitPrice, estimatedTotal: l.estimatedTotal })) } : undefined,
      },
      include: { lines: true },
    });
    await this.audit.log({ action: 'procurement.request.create', resource: 'PurchaseRequest', resourceId: request.id, actorId, organizationId, schoolId: data.schoolId });
    return request;
  }

  async createVendor(organizationId: string, schoolId: string, actorId: string, data: any) {
    await this.assertSchool(organizationId, schoolId);
    if (!data.name?.trim()) throw new BadRequestException('Vendor name is required');
    const existing = await this.db.vendor.findFirst({ where: { schoolId, name: data.name.trim() } });
    if (existing) throw new BadRequestException('A vendor with this name already exists for this school');
    const count = await this.db.vendor.count({ where: { schoolId } });
    const vendor = await this.db.vendor.create({ data: { code: `VND-${(count + 1).toString().padStart(6, '0')}`, name: data.name.trim(), contactName: data.contactName, email: data.email, phone: data.phone, address: data.address, taxId: data.taxId, schoolId } });
    await this.audit.log({ action: 'procurement.vendor.create', resource: 'Vendor', resourceId: vendor.id, actorId, organizationId, schoolId });
    return vendor;
  }

  async listVendors(organizationId: string, schoolId: string, includeInactive = false) {
    await this.assertSchool(organizationId, schoolId);
    return this.db.vendor.findMany({ where: { schoolId, ...(includeInactive ? {} : { isActive: true }) }, orderBy: { name: 'asc' } });
  }

  async listPurchaseOrders(organizationId: string, schoolId: string, status?: PurchaseOrderStatus) {
    await this.assertSchool(organizationId, schoolId);
    return this.db.purchaseOrder.findMany({ where: { schoolId, ...(status ? { status } : {}) }, include: { vendor: true, lines: { include: { item: true } }, receipts: true }, orderBy: { createdAt: 'desc' } });
  }

  async listReceipts(organizationId: string, schoolId: string) {
    await this.assertSchool(organizationId, schoolId);
    return this.db.goodsReceipt.findMany({ where: { schoolId, po: { school: { organizationId } } }, include: { po: { include: { vendor: true, lines: { include: { item: true } } } } }, orderBy: { receivedDate: 'desc' } });
  }

  async listPurchaseRequests(organizationId: string, schoolId: string, status?: PurchaseRequestStatus) {
    await this.assertSchool(organizationId, schoolId);
    return this.db.purchaseRequest.findMany({ where: { schoolId, ...(status ? { status } : {}) }, include: { lines: true, quotes: { include: { vendor: true, lines: true } } }, orderBy: { createdAt: 'desc' } });
  }

  async submitPurchaseRequest(organizationId: string, id: string, actorId: string) {
    const request = await this.db.purchaseRequest.findFirst({ where: { id, school: { organizationId } } });
    if (!request) throw new NotFoundException('Purchase request not found');
    if (request.status !== PurchaseRequestStatus.DRAFT) throw new BadRequestException('Only draft requests can be submitted');
    const updated = await this.db.purchaseRequest.update({ where: { id }, data: { status: PurchaseRequestStatus.SUBMITTED, submittedAt: new Date() }, include: { lines: true } });
    await this.audit.log({ action: 'procurement.request.submit', resource: 'PurchaseRequest', resourceId: id, actorId, organizationId, schoolId: request.schoolId });
    return updated;
  }

  async reviewPurchaseRequest(organizationId: string, id: string, actorId: string, decision: 'APPROVED' | 'REJECTED', reason?: string) {
    const request = await this.db.purchaseRequest.findFirst({ where: { id, school: { organizationId } } });
    if (!request) throw new NotFoundException('Purchase request not found');
    if (!([PurchaseRequestStatus.SUBMITTED, PurchaseRequestStatus.UNDER_REVIEW] as PurchaseRequestStatus[]).includes(request.status)) throw new BadRequestException('Request is not awaiting review');
    const updated = await this.db.purchaseRequest.update({ where: { id }, data: { status: decision, reviewedAt: new Date(), reviewedById: actorId, rejectionReason: decision === 'REJECTED' ? reason : null } });
    await this.audit.log({ action: `procurement.request.${decision.toLowerCase()}`, resource: 'PurchaseRequest', resourceId: id, actorId, organizationId, schoolId: request.schoolId, metadata: { reason } });
    return updated;
  }

  async addQuote(organizationId: string, requestId: string, actorId: string, data: any) {
    const request = await this.db.purchaseRequest.findFirst({ where: { id: requestId, school: { organizationId } } });
    if (!request) throw new NotFoundException('Purchase request not found');
    const vendor = await this.db.vendor.findFirst({ where: { id: data.vendorId, schoolId: request.schoolId, isActive: true } });
    if (!vendor) throw new NotFoundException('Vendor not found for this school');
    const lines = Array.isArray(data.lines) ? data.lines : [];
    if (!lines.length) throw new BadRequestException('Quote requires line items');
    const quote = await this.db.purchaseQuote.create({ data: { requestId, vendorId: vendor.id, quoteNumber: data.quoteNumber || `Q-${Date.now()}`, validUntil: data.validUntil ? new Date(data.validUntil) : undefined, subtotal: data.subtotal, taxAmount: data.taxAmount || 0, totalAmount: data.totalAmount, notes: data.notes, lines: { create: lines.map((l: any) => ({ itemId: l.itemId || null, description: l.description, quantity: Number(l.quantity), unitPrice: l.unitPrice, totalPrice: l.totalPrice })) } }, include: { vendor: true, lines: true } });
    await this.audit.log({ action: 'procurement.quote.create', resource: 'PurchaseQuote', resourceId: quote.id, actorId, organizationId, schoolId: request.schoolId, metadata: { vendorId: vendor.id } });
    return quote;
  }

  async selectQuote(organizationId: string, requestId: string, quoteId: string, actorId: string) {
    const quote = await this.db.purchaseQuote.findFirst({ where: { id: quoteId, requestId, request: { school: { organizationId } } }, include: { request: true } });
    if (!quote) throw new NotFoundException('Quote not found');
    if (quote.request.status !== PurchaseRequestStatus.APPROVED) throw new BadRequestException('Request must be approved before selecting a quote');
    await this.db.purchaseQuote.updateMany({ where: { requestId }, data: { status: 'REJECTED' } });
    const selected = await this.db.purchaseQuote.update({ where: { id: quoteId }, data: { status: 'SELECTED' }, include: { vendor: true, lines: true } });
    await this.audit.log({ action: 'procurement.quote.select', resource: 'PurchaseQuote', resourceId: quoteId, actorId, organizationId, schoolId: quote.request.schoolId });
    return selected;
  }

  async createPO(organizationId: string, data: any, actorId: string) {
    await this.assertSchool(organizationId, data.schoolId);
    const vendor = await this.db.vendor.findFirst({ where: { id: data.vendorId, schoolId: data.schoolId, isActive: true } });
    if (!vendor) throw new NotFoundException('Vendor not found for this school');
    const lines = Array.isArray(data.lines) ? data.lines : [];
    if (!lines.length) throw new BadRequestException('Purchase order requires line items');
    const total = lines.reduce((sum: number, l: any) => sum + Number(l.totalPrice || Number(l.quantity) * Number(l.unitPrice)), 0);
    if (data.totalAmount !== undefined && Number(data.totalAmount) !== total) throw new BadRequestException('PO total does not match line totals');
    const poNumber = `PO-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
    const po = await this.db.purchaseOrder.create({ data: { poNumber, vendorId: vendor.id, schoolId: data.schoolId, totalAmount: total, status: PurchaseOrderStatus.DRAFT, lines: { create: lines.map((l: any) => ({ itemId: l.itemId, quantity: Number(l.quantity), unitPrice: l.unitPrice, totalPrice: l.totalPrice ?? Number(l.quantity) * Number(l.unitPrice) })) } }, include: { lines: true, vendor: true } });
    await this.audit.log({ action: 'procurement.po.create', resource: 'PurchaseOrder', resourceId: po.id, actorId, organizationId, schoolId: data.schoolId });
    return po;
  }

  async transitionPO(organizationId: string, id: string, actorId: string, target: PurchaseOrderStatus) {
    const po = await this.db.purchaseOrder.findFirst({ where: { id, school: { organizationId } } });
    if (!po) throw new NotFoundException('Purchase order not found');
    const allowed: Record<string, PurchaseOrderStatus[]> = {
      [PurchaseOrderStatus.DRAFT]: [PurchaseOrderStatus.APPROVED, PurchaseOrderStatus.CANCELLED],
      [PurchaseOrderStatus.APPROVED]: [PurchaseOrderStatus.SENT, PurchaseOrderStatus.CANCELLED],
      [PurchaseOrderStatus.SENT]: [PurchaseOrderStatus.CLOSED, PurchaseOrderStatus.CANCELLED],
      [PurchaseOrderStatus.PARTIALLY_RECEIVED]: [PurchaseOrderStatus.CLOSED, PurchaseOrderStatus.CANCELLED],
      [PurchaseOrderStatus.RECEIVED]: [PurchaseOrderStatus.CLOSED],
    };
    if (!allowed[po.status]?.includes(target)) throw new BadRequestException(`Invalid PO transition ${po.status} -> ${target}`);
    const updated = await this.db.purchaseOrder.update({ where: { id }, data: { status: target } });
    await this.audit.log({ action: 'procurement.po.transition', resource: 'PurchaseOrder', resourceId: id, actorId, organizationId, schoolId: po.schoolId, metadata: { from: po.status, to: target } });
    return updated;
  }

  async recordReceipt(organizationId: string, data: any, actorId: string) {
    const po = await this.db.purchaseOrder.findFirst({ where: { id: data.poId, school: { organizationId } }, include: { lines: true } });
    if (!po) throw new NotFoundException('Purchase order not found');
    if (!([PurchaseOrderStatus.SENT, PurchaseOrderStatus.PARTIALLY_RECEIVED] as PurchaseOrderStatus[]).includes(po.status)) throw new BadRequestException('Only sent or partially received POs can be received');
    const items = Array.isArray(data.items) ? data.items : [];
    if (!items.length) throw new BadRequestException('Receipt requires items');
    return this.db.$transaction(async (tx) => {
      const grnNumber = `GRN-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
      const receipt = await tx.goodsReceipt.create({ data: { grnNumber, poId: po.id, schoolId: po.schoolId, receivedById: actorId } });
      for (const item of items) {
        const line = po.lines.find((l) => l.itemId === item.itemId);
        if (!line) throw new BadRequestException(`Item ${item.itemId} is not on the purchase order`);
        const remaining = line.quantity - line.receivedQty;
        if (Number(item.quantity) <= 0 || Number(item.quantity) > remaining) throw new BadRequestException(`Receipt quantity exceeds remaining PO quantity for ${item.itemId}`);
        await tx.purchaseOrderLine.update({ where: { id: line.id }, data: { receivedQty: { increment: Number(item.quantity) } } });
        await this.inventory.recordMovement(organizationId, { itemId: item.itemId, type: StockMovementType.RECEIPT, quantity: Number(item.quantity), destWarehouseId: item.warehouseId, referenceType: 'GRN', referenceId: receipt.id, reason: 'Goods received against PO' }, actorId);
      }
      const updatedLines = await tx.purchaseOrderLine.findMany({ where: { poId: po.id } });
      const fullyReceived = updatedLines.every((l) => l.receivedQty >= l.quantity);
      await tx.purchaseOrder.update({ where: { id: po.id }, data: { status: fullyReceived ? PurchaseOrderStatus.RECEIVED : PurchaseOrderStatus.PARTIALLY_RECEIVED } });
      await this.audit.log({ action: 'procurement.receipt.create', resource: 'GoodsReceipt', resourceId: receipt.id, actorId, organizationId, schoolId: po.schoolId });
      return receipt;
    });
  }

  async getDashboard(organizationId: string, schoolId: string) {
    await this.assertSchool(organizationId, schoolId);
    const [pendingRequests, approvedRequests, pendingPOs, totalValue, activeVendors, pendingReceipts] = await Promise.all([
      this.db.purchaseRequest.count({ where: { schoolId, status: { in: [PurchaseRequestStatus.SUBMITTED, PurchaseRequestStatus.UNDER_REVIEW] } } }),
      this.db.purchaseRequest.count({ where: { schoolId, status: PurchaseRequestStatus.APPROVED } }),
      this.db.purchaseOrder.count({ where: { schoolId, status: { in: [PurchaseOrderStatus.APPROVED, PurchaseOrderStatus.SENT, PurchaseOrderStatus.PARTIALLY_RECEIVED] } } }),
      this.db.purchaseOrder.aggregate({ where: { schoolId, status: { not: PurchaseOrderStatus.CANCELLED } }, _sum: { totalAmount: true } }),
      this.db.vendor.count({ where: { schoolId, isActive: true } }),
      this.db.purchaseOrder.count({ where: { schoolId, status: { in: [PurchaseOrderStatus.SENT, PurchaseOrderStatus.PARTIALLY_RECEIVED] } } }),
    ]);
    return { pendingRequests, approvedRequests, pendingOrders: pendingPOs, pendingReceipts, activeVendors, totalProcurementValue: totalValue._sum.totalAmount || 0 };
  }
}
