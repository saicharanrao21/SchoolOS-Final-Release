import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { SubscriptionStatus } from '@prisma/client';

@Injectable()
export class EntitlementsService {
  constructor(private readonly db: DatabaseService) {}

  async getTenantSubscription(organizationId: string) {
    const subscription = await this.db.saaSSubscription.findUnique({
      where: { organizationId },
      include: {
        plan: true,
        addons: { where: { isActive: true }, include: { addon: true } },
      },
    });

    if (!subscription) {
      throw new NotFoundException('No active SaaS subscription found for organization');
    }

    return subscription;
  }

  async getEntitlementSummary(organizationId: string) {
    const subscription = await this.getTenantSubscription(organizationId);
    const planLimits: any = subscription.plan.limits || {};

    // Calculate current usage across tenant schools
    const [studentCount, employeeCount, campusCount] = await Promise.all([
      this.db.student.count({ where: { school: { organizationId }, isActive: true } }),
      this.db.employee.count({ where: { school: { organizationId }, isActive: true } }),
      this.db.campus.count({ where: { school: { organizationId }, isActive: true } }),
    ]);

    const maxStudents = (planLimits.maxStudents || 500) + this.getAddonCapacity(subscription.addons, 'EXTRA_STUDENT');
    const maxStaff = (planLimits.maxStaff || 50) + this.getAddonCapacity(subscription.addons, 'EXTRA_STAFF');
    const maxCampuses = (planLimits.maxCampuses || 1) + this.getAddonCapacity(subscription.addons, 'EXTRA_CAMPUS');

    const isSubscriptionValid =
      subscription.status === SubscriptionStatus.ACTIVE ||
      subscription.status === SubscriptionStatus.TRIALING ||
      subscription.status === SubscriptionStatus.GRACE_PERIOD;

    return {
      status: subscription.status,
      planName: subscription.plan.name,
      planCode: subscription.plan.code,
      isSubscriptionValid,
      limits: {
        students: { limit: maxStudents, current: studentCount, allowed: isSubscriptionValid && studentCount < maxStudents },
        staff: { limit: maxStaff, current: employeeCount, allowed: isSubscriptionValid && employeeCount < maxStaff },
        campuses: { limit: maxCampuses, current: campusCount, allowed: isSubscriptionValid && campusCount < maxCampuses },
      },
    };
  }

  private getAddonCapacity(subscriptionAddons: any[], addonType: string): number {
    return subscriptionAddons
      .filter(a => a.addon.type === addonType)
      .reduce((sum, a) => sum + (a.quantity * 100), 0);
  }

  async checkCanCreateStudent(organizationId: string): Promise<boolean> {
    const summary = await this.getEntitlementSummary(organizationId);
    if (!summary.limits.students.allowed) {
      throw new ForbiddenException(`SaaS student limit exceeded for plan (${summary.limits.students.current}/${summary.limits.students.limit}). Upgrade subscription plan.`);
    }
    return true;
  }
}
