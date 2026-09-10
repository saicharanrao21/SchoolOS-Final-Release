import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('inventory')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Post('items')
  @Permissions('inventory.manage')
  async createItem(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.createItem(organizationId, data, actorId);
  }

  @Post('movements')
  @Permissions('inventory.transfer', 'inventory.issue', 'inventory.receive')
  async recordMovement(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.recordMovement(organizationId, data, actorId);
  }

  @Get('dashboard')
  @Permissions('inventory.read')
  async getDashboard(@User('org') organizationId: string, @Query('schoolId') schoolId: string) {
    return this.service.getDashboard(organizationId, schoolId);
  }

  @Get('items')
  @Permissions('inventory.read')
  async findAllItems(@Query('schoolId') schoolId: string) {
    return this.service.findAllItems(schoolId);
  }
}
