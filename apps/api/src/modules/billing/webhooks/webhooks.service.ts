import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SaaSPaymentProvider, SaaSPaymentStatus, SaaSInvoiceStatus, SubscriptionStatus, Prisma } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class SaaSWebhooksService {
  private readonly logger = new Logger(SaaSWebhooksService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async processWebhook(provider: SaaSPaymentProvider, rawPayload: any, signature?: string) {
    const eventId = rawPayload.id || rawPayload.event_id || `evt_${Date.now()}`;
    const eventType = rawPayload.event || rawPayload.type || 'payment.success';

    // Idempotency check
    const existing = await this.db.saaSWebhookEvent.findUnique({
      where: { provider_eventId: { provider, eventId } },
    });

    if (existing && existing.processed) {
      this.logger.log(`Webhook event ${eventId} already processed safely.`);
      return { success: true, idempotent: true };
    }

    // Verify signature
    this.verifySignature(provider, rawPayload, signature);

    return this.db.$transaction(async (tx) => {
      await tx.saaSWebhookEvent.upsert({
        where: { provider_eventId: { provider, eventId } },
        update: { processed: true, processedAt: new Date() },
        create: {
          provider,
          eventId,
          eventType,
          payload: rawPayload,
          processed: true,
          processedAt: new Date(),
        },
      });

      // Handle Payment Success
      if (['payment.captured', 'checkout.session.completed', 'charge.succeeded'].includes(eventType)) {
        const invoiceId = rawPayload.notes?.invoiceId || rawPayload.metadata?.invoiceId;
        const organizationId = rawPayload.notes?.organizationId || rawPayload.metadata?.organizationId;

        if (invoiceId) {
          const invoice = await tx.saaSInvoice.findUnique({ where: { id: invoiceId } });
          if (invoice) {
            await tx.saaSInvoice.update({
              where: { id: invoiceId },
              data: {
                status: SaaSInvoiceStatus.PAID,
                amountPaid: invoice.totalAmount,
                amountDue: new Prisma.Decimal(0),
                paidAt: new Date(),
              },
            });

            if (invoice.subscriptionId) {
              await tx.saaSSubscription.update({
                where: { id: invoice.subscriptionId },
                data: { status: SubscriptionStatus.ACTIVE },
              });
            }

            const paymentCount = await tx.saaSPayment.count({ where: { organizationId: invoice.organizationId } });
            await tx.saaSPayment.create({
              data: {
                paymentNumber: `PAY-SAAS-${new Date().getFullYear()}-${(paymentCount + 1).toString().padStart(6, '0')}`,
                organizationId: invoice.organizationId,
                subscriptionId: invoice.subscriptionId,
                invoiceId: invoice.id,
                amount: invoice.totalAmount,
                currency: invoice.currency,
                provider,
                providerPaymentId: rawPayload.payment_id || rawPayload.id,
                providerOrderId: rawPayload.order_id,
                status: SaaSPaymentStatus.SUCCESS,
                paidAt: new Date(),
              },
            });

            this.eventEmitter.emit('billing.payment.succeeded', {
              organizationId: invoice.organizationId,
              invoiceId: invoice.id,
            });
          }
        }
      }

      return { success: true };
    });
  }

  private verifySignature(provider: SaaSPaymentProvider, payload: any, signature?: string) {
    if (provider === SaaSPaymentProvider.RAZORPAY && process.env.RAZORPAY_WEBHOOK_SECRET) {
      const expected = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(JSON.stringify(payload))
        .digest('hex');
      if (signature && signature !== expected) {
        throw new BadRequestException('Invalid Razorpay webhook signature');
      }
    }
  }
}
