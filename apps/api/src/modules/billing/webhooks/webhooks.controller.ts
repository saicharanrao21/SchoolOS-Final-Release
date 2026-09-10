import { Controller, Post, Body, Headers, Param } from '@nestjs/common';
import { SaaSWebhooksService } from './webhooks.service';
import { SaaSPaymentProvider } from '@prisma/client';

@Controller('billing/webhooks')
export class SaaSWebhooksController {
  constructor(private readonly service: SaaSWebhooksService) {}

  @Post(':provider')
  async handleWebhook(
    @Param('provider') providerStr: string,
    @Body() payload: any,
    @Headers('x-razorpay-signature') razorpaySignature?: string,
    @Headers('stripe-signature') stripeSignature?: string,
  ) {
    const provider = providerStr.toUpperCase() === 'STRIPE' ? SaaSPaymentProvider.STRIPE : SaaSPaymentProvider.RAZORPAY;
    const signature = provider === SaaSPaymentProvider.STRIPE ? stripeSignature : razorpaySignature;
    return this.service.processWebhook(provider, payload, signature);
  }
}
