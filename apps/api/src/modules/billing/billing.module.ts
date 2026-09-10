import { Module } from '@nestjs/common';
import { SaaSPlansService } from './plans/plans.service';
import { SaaSPlansController } from './plans/plans.controller';
import { SaaSSubscriptionsService } from './subscriptions/subscriptions.service';
import { SaaSSubscriptionsController } from './subscriptions/subscriptions.controller';
import { EntitlementsService } from './entitlements/entitlements.service';
import { EntitlementsController } from './entitlements/entitlements.controller';
import { SaaSWebhooksService } from './webhooks/webhooks.service';
import { SaaSWebhooksController } from './webhooks/webhooks.controller';

@Module({
  controllers: [
    SaaSPlansController,
    SaaSSubscriptionsController,
    EntitlementsController,
    SaaSWebhooksController,
  ],
  providers: [
    SaaSPlansService,
    SaaSSubscriptionsService,
    EntitlementsService,
    SaaSWebhooksService,
  ],
  exports: [
    SaaSPlansService,
    SaaSSubscriptionsService,
    EntitlementsService,
    SaaSWebhooksService,
  ],
})
export class BillingModule {}
