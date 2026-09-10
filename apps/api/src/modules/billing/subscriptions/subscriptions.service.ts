import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SubscriptionStatus, SaaSInvoiceStatus, Prisma } from '@prisma/client';

@Injectable()
export class SaaSSubscriptionsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getSubscription(organizationId: string) {
    const sub = await this.db.saaSSubscription.findUnique({
      where: { organizationId },
      include: {
        plan: true,
        addons: { include: { addon: true } },
        invoices: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!sub) throw new NotFoundException('Subscription not found for tenant');
    return sub;
  }

  async startTrial(organizationId: string, planCode: string, actorId: string) {
    const plan = await this.db.saaSPlan.findUnique({ where: { code: planCode } });
    if (!plan) throw new NotFoundException('SaaS plan not found');

    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + plan.trialDays);

    return this.db.saaSSubscription.upsert({
      where: { organizationId },
      update: {
        planId: plan.id,
        status: SubscriptionStatus.TRIALING,
        trialStart: now,
        trialEnd,
        currentPeriodStart: now,
        currentPeriodEnd: trialEnd,
      },
      create: {
        organizationId,
        planId: plan.id,
        status: SubscriptionStatus.TRIALING,
        trialStart: now,
        trialEnd,
        currentPeriodStart: now,
        currentPeriodEnd: trialEnd,
      },
    });
  }

  async subscribe(organizationId: string, planCode: string, billingCycle: string, actorId: string) {
    const plan = await this.db.saaSPlan.findUnique({ where: { code: planCode } });
    if (!plan) throw new NotFoundException('SaaS plan not found');

    const amount = billingCycle === 'YEARLY' ? plan.yearlyPrice : plan.monthlyPrice;
    const now = new Date();
    const periodEnd = new Date(now);
    if (billingCycle === 'YEARLY') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    const year = now.getFullYear();
    const count = await this.db.saaSInvoice.count({ where: { organizationId } });
    const invoiceNumber = `INV-SAAS-${year}-${(count + 1).toString().padStart(6, '0')}`;

    return this.db.$transaction(async (tx) => {
      const sub = await tx.saaSSubscription.upsert({
        where: { organizationId },
        update: {
          planId: plan.id,
          status: SubscriptionStatus.ACTIVE,
          billingCycle,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
        create: {
          organizationId,
          planId: plan.id,
          status: SubscriptionStatus.ACTIVE,
          billingCycle,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      });

      const invoice = await tx.saaSInvoice.create({
        data: {
          invoiceNumber,
          organizationId,
          subscriptionId: sub.id,
          subtotal: amount,
          totalAmount: amount,
          amountDue: amount,
          currency: plan.currency,
          status: SaaSInvoiceStatus.OPEN,
          billingPeriodStart: now,
          billingPeriodEnd: periodEnd,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          lines: {
            create: [
              {
                description: `${plan.name} Subscription (${billingCycle})`,
                quantity: 1,
                unitPrice: amount,
                amount,
              },
            ],
          },
        },
      });

      await this.audit.log({
        action: 'billing.subscription.subscribe',
        resource: 'SaaSSubscription',
        resourceId: sub.id,
        actorId,
        organizationId,
      });

      this.eventEmitter.emit('billing.subscription.created', {
        organizationId,
        subscriptionId: sub.id,
        invoiceId: invoice.id,
      });

      return { subscription: sub, invoice };
    });
  }

  async cancelSubscription(organizationId: string, actorId: string) {
    const sub = await this.db.saaSSubscription.findUnique({ where: { organizationId } });
    if (!sub) throw new NotFoundException('Subscription not found');

    const updated = await this.db.saaSSubscription.update({
      where: { organizationId },
      data: {
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
      },
    });

    await this.audit.log({
      action: 'billing.subscription.cancel',
      resource: 'SaaSSubscription',
      resourceId: sub.id,
      actorId,
      organizationId,
    });

    return updated;
  }
}
