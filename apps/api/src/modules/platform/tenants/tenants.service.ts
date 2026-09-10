import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SaaSSubscriptionsService } from '../../billing/subscriptions/subscriptions.service';

export enum TenantLifecycleState {
  PROVISIONING = 'PROVISIONING',
  ACTIVE = 'ACTIVE',
  TRIAL = 'TRIAL',
  SUSPENDED = 'SUSPENDED',
  PAST_DUE = 'PAST_DUE',
  DEACTIVATED = 'DEACTIVATED',
}

@Injectable()
export class PlatformTenantsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
    private readonly eventEmitter: EventEmitter2,
    private readonly billing: SaaSSubscriptionsService,
  ) {}

  async listTenants() {
    const orgs = await this.db.organization.findMany({
      include: {
        schools: { select: { id: true, name: true, _count: { select: { students: true, employees: true } } } },
        saasSubscription: { include: { plan: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orgs.map(org => {
      const totalStudents = org.schools.reduce((sum, s) => sum + s._count.students, 0);
      const totalStaff = org.schools.reduce((sum, s) => sum + s._count.employees, 0);

      return {
        id: org.id,
        name: org.name,
        code: org.code,
        schoolsCount: org.schools.length,
        totalStudents,
        totalStaff,
        subscriptionStatus: org.saasSubscription?.status || 'NO_SUBSCRIPTION',
        planName: org.saasSubscription?.plan.name || 'Free Trial',
        createdAt: org.createdAt,
      };
    });
  }

  async getTenantDetail(organizationId: string) {
    const org = await this.db.organization.findUnique({
      where: { id: organizationId },
      include: {
        schools: true,
        saasSubscription: { include: { plan: true, invoices: { take: 5, orderBy: { createdAt: 'desc' } } } },
      },
    });

    if (!org) throw new NotFoundException('Organization tenant not found');
    return org;
  }

  async updateTenantStatus(organizationId: string, status: TenantLifecycleState, actorId: string, reason?: string) {
    const org = await this.db.organization.findUnique({ where: { id: organizationId } });
    if (!org) throw new NotFoundException('Organization tenant not found');

    // Update SaaS subscription status if suspended or reactivated
    if (status === TenantLifecycleState.SUSPENDED) {
      await this.db.saaSSubscription.updateMany({
        where: { organizationId },
        data: { status: 'SUSPENDED' },
      });
    } else if (status === TenantLifecycleState.ACTIVE) {
      await this.db.saaSSubscription.updateMany({
        where: { organizationId, status: 'SUSPENDED' },
        data: { status: 'ACTIVE' },
      });
    }

    await this.audit.log({
      action: `platform.tenant.${status.toLowerCase()}`,
      resource: 'Organization',
      resourceId: organizationId,
      actorId,
      organizationId,
      metadata: { status, reason },
    });

    this.eventEmitter.emit('platform.tenant.status_changed', {
      organizationId,
      status,
      actorId,
    });

    return { success: true, organizationId, status };
  }

  async getPlatformKPIs() {
    const [totalTenants, totalSchools, totalStudents, activeSubscriptions] = await Promise.all([
      this.db.organization.count(),
      this.db.school.count(),
      this.db.student.count({ where: { isActive: true } }),
      this.db.saaSSubscription.count({ where: { status: 'ACTIVE' } }),
    ]);

    return {
      totalTenants,
      totalSchools,
      totalStudents,
      activeSubscriptions,
    };
  }
}
