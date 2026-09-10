import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SaaSPlansService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async getPublicPlans() {
    return this.db.saaSPlan.findMany({
      where: { isActive: true, isPublic: true },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async createPlan(data: any, actorId: string) {
    const plan = await this.db.saaSPlan.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        monthlyPrice: new Prisma.Decimal(data.monthlyPrice),
        yearlyPrice: new Prisma.Decimal(data.yearlyPrice),
        currency: data.currency || 'USD',
        trialDays: data.trialDays || 14,
        features: data.features || {},
        limits: data.limits || { maxStudents: 500, maxStaff: 50, maxCampuses: 1 },
        isActive: true,
        isPublic: data.isPublic !== false,
        displayOrder: data.displayOrder || 1,
      },
    });

    await this.audit.log({
      action: 'billing.plan.create',
      resource: 'SaaSPlan',
      resourceId: plan.id,
      actorId,
      organizationId: 'SYSTEM',
    });

    return plan;
  }

  async getPlanByCode(code: string) {
    const plan = await this.db.saaSPlan.findUnique({ where: { code } });
    if (!plan) throw new NotFoundException('SaaS plan not found');
    return plan;
  }
}
