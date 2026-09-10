import { Controller, Get, UseGuards } from '@nestjs/common';
import { EntitlementsService } from './entitlements.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';

@Controller('billing/entitlements')
@UseGuards(AuthGuard('jwt'))
export class EntitlementsController {
  constructor(private readonly service: EntitlementsService) {}

  @Get('summary')
  async getSummary(@User('org') organizationId: string) {
    return this.service.getEntitlementSummary(organizationId);
  }
}
