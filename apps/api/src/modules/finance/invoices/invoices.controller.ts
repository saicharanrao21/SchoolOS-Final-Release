import { Controller, Get, UseGuards, Query, Param } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('finance/invoices')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class InvoicesController {
  constructor(private readonly service: InvoicesService) {}

  @Get()
  @Permissions('fees.read')
  findAll(@User('org') organizationId: string, @Query() filters: any) {
    return this.service.findAll(organizationId, filters);
  }

  @Get(':id')
  @Permissions('fees.read')
  findOne(@User('org') organizationId: string, @Param('id') id: string) {
    return this.service.findOne(organizationId, id);
  }
}
