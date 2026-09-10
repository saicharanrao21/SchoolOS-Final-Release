import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { InternalVendorsService } from './internal-vendors.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('internal/vendors')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class InternalVendorsController {
  constructor(private readonly service: InternalVendorsService) {}

  @Post()
  @Permissions('internal.vendors.manage')
  async create(
    @User('org') organizationId: string,
    @User('id') actorId: string,
    @Body() data: any,
  ) {
    return this.service.createVendor(organizationId, data, actorId);
  }

  @Get()
  @Permissions('internal.vendors.read')
  async getVendors(@User('org') organizationId: string) {
    return this.service.getVendors(organizationId);
  }
}
