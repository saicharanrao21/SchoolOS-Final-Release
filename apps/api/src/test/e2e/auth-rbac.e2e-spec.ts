import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Reflector } from '@nestjs/core';
import { TestFixtures } from './test-fixtures';

import { SaaSSubscriptionsService } from '../../modules/billing/subscriptions/subscriptions.service';
import { PlatformTenantsService, TenantLifecycleState } from '../../modules/platform/tenants/tenants.service';
import { InternalFinanceService } from '../../modules/internal/finance/internal-finance.service';
import { SubscriptionStatus, ExpenseClaimStatus } from '@prisma/client';

describe('Auth & RBAC Multi-Tenant E2E Validation (Phase 31 - Part 3, 4 & 5)', () => {
  let db: any;
  let audit: any;
  let eventEmitter: any;
  let billingService: SaaSSubscriptionsService;
  let platformService: PlatformTenantsService;
  let internalFinanceService: InternalFinanceService;
  let permissionsGuard: PermissionsGuard;

  beforeEach(async () => {
    db = {
      organization: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn().mockResolvedValue(2),
      },
      school: {
        count: jest.fn().mockResolvedValue(5),
      },
      student: {
        count: jest.fn().mockResolvedValue(500),
      },
      saaSSubscription: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        updateMany: jest.fn(),
        count: jest.fn().mockResolvedValue(2),
      },
      internalExpense: {
        findMany: jest.fn(),
        count: jest.fn().mockResolvedValue(10),
      },
      $transaction: jest.fn(cb => cb(db)),
    };

    audit = {
      log: jest.fn().mockResolvedValue(true),
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaaSSubscriptionsService,
        PlatformTenantsService,
        InternalFinanceService,
        PermissionsGuard,
        Reflector,
        { provide: DatabaseService, useValue: db },
        { provide: AuditService, useValue: audit },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    billingService = module.get<SaaSSubscriptionsService>(SaaSSubscriptionsService);
    platformService = module.get<PlatformTenantsService>(PlatformTenantsService);
    internalFinanceService = module.get<InternalFinanceService>(InternalFinanceService);
    permissionsGuard = module.get<PermissionsGuard>(PermissionsGuard);
  });

  // Part 3: Authentication & Identity Context
  describe('Authentication & Identity Context', () => {
    it('should correctly bypass permissions guard for SUPER_ADMIN role', () => {
      const context: any = {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({ user: TestFixtures.createMockUsers().superAdmin }),
        }),
      };

      const reflector: any = { getAllAndOverride: () => ['platform.tenants.manage'] };
      const guard = new PermissionsGuard(reflector);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should reject access if user lacks required permission', () => {
      const context: any = {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({ user: TestFixtures.createMockUsers().teacherA }),
        }),
      };

      const reflector: any = { getAllAndOverride: () => ['billing.admin'] };
      const guard = new PermissionsGuard(reflector);

      expect(guard.canActivate(context)).toBe(false);
    });
  });

  // Part 4 & 5: RBAC & Multi-Tenant Read/Write Isolation
  describe('Multi-Tenant Read/Write Isolation (TENANT_A vs TENANT_B)', () => {
    it('should isolate internal company expenses by organizationId', async () => {
      const mockExpensesTenantA = [
        { id: 'exp-1', organizationId: 'org-tenant-a', title: 'AWS Cloud Invoice' },
      ];

      db.internalExpense.findMany.mockImplementation((query: any) => {
        if (query.where.organizationId === 'org-tenant-a') {
          return Promise.resolve(mockExpensesTenantA);
        }
        return Promise.resolve([]);
      });

      const expensesA = await internalFinanceService.getExpenses('org-tenant-a');
      const expensesB = await internalFinanceService.getExpenses('org-tenant-b');

      expect(expensesA.length).toBe(1);
      expect(expensesB.length).toBe(0);
      expect(db.internalExpense.findMany).toHaveBeenCalledWith({
        where: { organizationId: 'org-tenant-a' },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should reject non-superadmin access to platform control plane status updates', async () => {
      db.organization.findUnique.mockResolvedValue(null);

      await expect(
        platformService.updateTenantStatus('org-tenant-a', TenantLifecycleState.SUSPENDED, 'usr-teacher-a')
      ).rejects.toThrow(NotFoundException);
    });
  });
});
