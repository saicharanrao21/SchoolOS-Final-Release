import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';
import { AuthorizationService } from './authorization.service';
import { DelegationService } from './delegation.service';
import { ForbiddenException } from '@nestjs/common';

describe('Phase 0.3.1 Security Remediation Suite', () => {
  let authz: AuthorizationService;
  let delegation: DelegationService;
  let db: any;

  beforeEach(async () => {
    db = {
      user: {
        findFirst: jest.fn(),
      },
      school: {
        findFirst: jest.fn(),
      },
      authorityDelegation: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
      },
      role: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorizationService,
        DelegationService,
        { provide: DatabaseService, useValue: db },
        { provide: AuditService, useValue: { log: jest.fn().mockResolvedValue(true) } },
      ],
    }).compile();

    authz = module.get<AuthorizationService>(AuthorizationService);
    delegation = module.get<DelegationService>(DelegationService);
  });

  // A: Strict Scope Access - School Existence != User Authorization
  describe('A: Strict Scope Access (canAccessScope)', () => {
    it('MUST DENY user access to a school in the same org if they have NO explicit membership or delegation', async () => {
      db.user.findFirst.mockResolvedValue({
        id: 'user-1',
        organizationId: 'org-1',
        status: 'ACTIVE',
        roles: [],
        memberships: [
          { schoolId: 'school-a', campusId: null, isActive: true }, // Membership ONLY in School A
        ],
      });

      // Target School B exists in same Org 1
      const canAccessSchoolB = await authz.canAccessScope('user-1', 'org-1', 'school-b');

      expect(canAccessSchoolB).toBe(false); // NO MORE LEAK: Same org school is blocked without explicit membership
    });

    it('MUST ALLOW user access to School A when explicit membership in School A exists', async () => {
      db.user.findFirst.mockResolvedValue({
        id: 'user-1',
        organizationId: 'org-1',
        status: 'ACTIVE',
        roles: [],
        memberships: [
          { schoolId: 'school-a', campusId: null, isActive: true },
        ],
      });

      const canAccessSchoolA = await authz.canAccessScope('user-1', 'org-1', 'school-a');
      expect(canAccessSchoolA).toBe(true);
    });
  });

  // E: Delegation Escalation Prevention
  describe('E: Delegation Security & Escalation Blocking', () => {
    it('MUST BLOCK a user from delegating a permission they do NOT possess', async () => {
      db.user.findFirst.mockResolvedValue({ id: 'delegatee-1', organizationId: 'org-1', status: 'ACTIVE' });

      // Delegator has NO finance permissions
      jest.spyOn(authz, 'resolveEffectivePermissions').mockResolvedValue(new Set(['students.read']));

      await expect(
        delegation.createDelegation('org-1', 'delegator-1', {
          delegateeId: 'delegatee-1',
          permissions: ['finance.refund'], // Delegator does NOT have refund
          validUntil: new Date(Date.now() + 86400000),
          reason: 'Attempted Escalation',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('MUST BLOCK delegating SUPER_ADMIN role', async () => {
      db.user.findFirst.mockResolvedValue({ id: 'delegatee-1', organizationId: 'org-1', status: 'ACTIVE' });
      db.role.findUnique.mockResolvedValue({ id: 'role-sa', name: 'SUPER_ADMIN', permissions: [] });

      jest.spyOn(authz, 'resolveEffectivePermissions').mockResolvedValue(new Set(['students.read']));

      await expect(
        delegation.createDelegation('org-1', 'delegator-1', {
          delegateeId: 'delegatee-1',
          roleId: 'role-sa',
          validUntil: new Date(Date.now() + 86400000),
          reason: 'SuperAdmin Escalation Attempt',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
