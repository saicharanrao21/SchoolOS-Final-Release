import { Controller, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { OffersService } from './offers.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('admissions/offers')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  @Permissions('admissions.offer.manage')
  createOffer(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.offersService.createOffer(organizationId, data, actorId);
  }

  @Patch(':id/status')
  @Permissions('admissions.offer.manage')
  updateOfferStatus(@User('org') organizationId: string, @Param('id') id: string, @Body('status') status: string, @User('id') actorId: string) {
    return this.offersService.updateOfferStatus(organizationId, id, status, actorId);
  }
}
