import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { CompanyContractsService } from './contracts.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('internal/contracts')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class CompanyContractsController {
  constructor(private readonly service: CompanyContractsService) {}

  @Post()
  @Permissions('internal.contracts.manage')
  async create(
    @User('org') organizationId: string,
    @User('id') actorId: string,
    @Body() data: any,
  ) {
    return this.service.createContract(organizationId, data, actorId);
  }

  @Get()
  @Permissions('internal.contracts.read')
  async getContracts(@User('org') organizationId: string) {
    return this.service.getContracts(organizationId);
  }

  @Get('expiring')
  @Permissions('internal.contracts.read')
  async getExpiring(@User('org') organizationId: string, @Query('days') daysStr?: string) {
    const days = daysStr ? parseInt(daysStr, 10) : 30;
    return this.service.getExpiringContracts(organizationId, days);
  }
}
