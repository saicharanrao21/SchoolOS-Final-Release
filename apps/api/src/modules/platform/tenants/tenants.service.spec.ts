import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { SaaSSubscriptionsService } from '../../billing/subscriptions/subscriptions.service';
import { NotFoundException } from '@nestjs/common';
import { PlatformTenantsService, TenantLifecycleState } from './tenants.service';

jest.mock('@nestjs/event-emitter', () => ({
  EventEmitter2: jest.fn().mockImplementation(() => ({
    emit: jest.fn(),
  })),
  OnEvent: jest.fn().mockImplementation(() => jest.fn()),
}));

import { EventEmitter2 } from '@nestjs/event-emitter';

describe('PlatformTenantsService', () => {
  let service: PlatformTenantsService;
  let db: any;
  let audit: any;
  let eventEmitter: any;
  let billing: any;

  beforeEach(async () => {
    db = {
      organization: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn().mockResolvedValue(10),
      },
      school: {
        count: jest.fn().mockResolvedValue(25),
      },
      student: {
        count: jest.fn().mockResolvedValue(1500),
      },
      saaSSubscription: {
        count: jest.fn().mockResolvedValue(8),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };

    audit = {
      log: jest.fn().mockResolvedValue(true),
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    billing = {
      getSubscription: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlatformTenantsService,
        { provide: DatabaseService, useValue: db },
        { provide: AuditService, useValue: audit },
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: SaaSSubscriptionsService, useValue: billing },
      ],
    }).compile();

    service = module.get<PlatformTenantsService>(PlatformTenantsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPlatformKPIs', () => {
    it('should return aggregated platform metrics', async () => {
      const kpis = await service.getPlatformKPIs();
      expect(kpis).toEqual({
        totalTenants: 10,
        totalSchools: 25,
        totalStudents: 1500,
        activeSubscriptions: 8,
      });
    });
  });

  describe('updateTenantStatus', () => {
    it('should throw NotFoundException if organization does not exist', async () => {
      db.organization.findUnique.mockResolvedValue(null);

      await expect(
        service.updateTenantStatus('org-99', TenantLifecycleState.SUSPENDED, 'actor-1')
      ).rejects.toThrow(NotFoundException);
    });

    it('should update status, adjust subscription and log audit event', async () => {
      db.organization.findUnique.mockResolvedValue({ id: 'org-1', name: 'Greenwood Org' });

      const result = await service.updateTenantStatus('org-1', TenantLifecycleState.SUSPENDED, 'actor-1', 'Non payment');

      expect(db.saaSSubscription.updateMany).toHaveBeenCalledWith({
        where: { organizationId: 'org-1' },
        data: { status: 'SUSPENDED' },
      });
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'platform.tenant.suspended',
          resource: 'Organization',
        })
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith('platform.tenant.status_changed', expect.any(Object));
      expect(result.status).toEqual(TenantLifecycleState.SUSPENDED);
    });
  });
});
