import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SaaSSubscriptionsService } from './subscriptions.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('billing/subscriptions')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class SaaSSubscriptionsController {
  constructor(private readonly service: SaaSSubscriptionsService) {}

  @Get('me')
  @Permissions('billing.subscriptions.read')
  async getMySubscription(@User('org') organizationId: string) {
    return this.service.getSubscription(organizationId);
  }

  @Post('trial')
  @Permissions('billing.subscriptions.manage')
  async startTrial(@User('org') organizationId: string, @User('id') actorId: string, @Body() body: { planCode: string }) {
    return this.service.startTrial(organizationId, body.planCode, actorId);
  }

  @Post('subscribe')
  @Permissions('billing.subscriptions.manage')
  async subscribe(@User('org') organizationId: string, @User('id') actorId: string, @Body() body: { planCode: string; billingCycle: string }) {
    return this.service.subscribe(organizationId, body.planCode, body.billingCycle || 'MONTHLY', actorId);
  }

  @Post('cancel')
  @Permissions('billing.subscriptions.manage')
  async cancel(@User('org') organizationId: string, @User('id') actorId: string) {
    return this.service.cancelSubscription(organizationId, actorId);
  }
}
