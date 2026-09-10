import { Controller, Get, Post, Body, Param, UseGuards, Query, Patch } from '@nestjs/common';
import { ProcurementService } from './procurement.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { PurchaseRequestStatus, PurchaseOrderStatus } from '@prisma/client';

@Controller('procurement')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ProcurementController {
  constructor(private readonly service: ProcurementService) {}

  @Post('vendors')
  @Permissions('vendor.manage')
  createVendor(@User('org') org: string, @Query('schoolId') schoolId: string, @Body() data: any, @User('id') actor: string) { return this.service.createVendor(org, schoolId, actor, data); }

  @Get('vendors')
  @Permissions('vendor.read')
  listVendors(@User('org') org: string, @Query('schoolId') schoolId: string, @Query('includeInactive') includeInactive?: string) { return this.service.listVendors(org, schoolId, includeInactive === 'true'); }

  @Get('orders')
  @Permissions('procurement.read')
  listPurchaseOrders(@User('org') org: string, @Query('schoolId') schoolId: string, @Query('status') status?: PurchaseOrderStatus) { return this.service.listPurchaseOrders(org, schoolId, status); }

  @Get('receipts')
  @Permissions('procurement.read')
  listReceipts(@User('org') org: string, @Query('schoolId') schoolId: string) { return this.service.listReceipts(org, schoolId); }

  @Post('requests')
  @Permissions('procurement.create')
  createRequest(@User('org') org: string, @Body() data: any, @User('id') actor: string) { return this.service.createPurchaseRequest(org, data, actor); }

  @Get('requests')
  @Permissions('procurement.read')
  listRequests(@User('org') org: string, @Query('schoolId') schoolId: string, @Query('status') status?: PurchaseRequestStatus) { return this.service.listPurchaseRequests(org, schoolId, status); }

  @Post('requests/:id/submit')
  @Permissions('procurement.create')
  submitRequest(@User('org') org: string, @Param('id') id: string, @User('id') actor: string) { return this.service.submitPurchaseRequest(org, id, actor); }

  @Post('requests/:id/review')
  @Permissions('procurement.approve')
  reviewRequest(@User('org') org: string, @Param('id') id: string, @Body() body: { decision: 'APPROVED' | 'REJECTED'; reason?: string }, @User('id') actor: string) { return this.service.reviewPurchaseRequest(org, id, actor, body.decision, body.reason); }

  @Post('requests/:id/quotes')
  @Permissions('procurement.create')
  addQuote(@User('org') org: string, @Param('id') id: string, @Body() data: any, @User('id') actor: string) { return this.service.addQuote(org, id, actor, data); }

  @Post('requests/:id/quotes/:quoteId/select')
  @Permissions('procurement.approve')
  selectQuote(@User('org') org: string, @Param('id') id: string, @Param('quoteId') quoteId: string, @User('id') actor: string) { return this.service.selectQuote(org, id, quoteId, actor); }

  @Post('po')
  @Permissions('procurement.po.create')
  createPO(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) { return this.service.createPO(organizationId, data, actorId); }

  @Patch('po/:id/status')
  @Permissions('procurement.po.approve')
  transitionPO(@User('org') org: string, @Param('id') id: string, @Body('status') status: PurchaseOrderStatus, @User('id') actor: string) { return this.service.transitionPO(org, id, actor, status); }

  @Post('receipts')
  @Permissions('procurement.receive')
  recordReceipt(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) { return this.service.recordReceipt(organizationId, data, actorId); }

  @Get('dashboard')
  @Permissions('procurement.read')
  getDashboard(@User('org') organizationId: string, @Query('schoolId') schoolId: string) { return this.service.getDashboard(organizationId, schoolId); }
}
