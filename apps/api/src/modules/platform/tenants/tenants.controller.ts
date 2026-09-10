import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PlatformTenantsService, TenantLifecycleState } from './tenants.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('platform/tenants')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class PlatformTenantsController {
  constructor(private readonly service: PlatformTenantsService) {}

  @Get()
  @Permissions('platform.tenants.read')
  async listTenants() {
    return this.service.listTenants();
  }

  @Get('kpis')
  @Permissions('platform.tenants.read')
  async getKPIs() {
    return this.service.getPlatformKPIs();
  }

  @Get(':id')
  @Permissions('platform.tenants.read')
  async getTenantDetail(@Param('id') organizationId: string) {
    return this.service.getTenantDetail(organizationId);
  }

  @Patch(':id/status')
  @Permissions('platform.tenants.manage')
  async updateStatus(
    @User('id') actorId: string,
    @Param('id') organizationId: string,
    @Body() body: { status: TenantLifecycleState; reason?: string },
  ) {
    return this.service.updateTenantStatus(organizationId, body.status, actorId, body.reason);
  }
}
