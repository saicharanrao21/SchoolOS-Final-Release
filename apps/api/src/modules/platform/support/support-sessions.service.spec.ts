import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { SupportSessionsService } from './support-sessions.service';

const session = {
  id: 'session-1',
  sessionToken: 'hashed',
  organizationId: 'org-1',
  actorUserId: 'admin-1',
  targetUserId: 'user-1',
  reason: 'Investigate reported issue',
  startedAt: new Date(),
  expiresAt: new Date(Date.now() + 60_000),
  endedAt: null,
  isActive: true,
};

function targetUser() {
  return {
    id: 'user-1',
    email: 'admin@school.test',
    firstName: 'School',
    lastName: 'Admin',
    organizationId: 'org-1',
    status: 'ACTIVE',
    roles: [{ role: { name: 'ADMIN', permissions: [{ permission: { name: 'students.read' } }] } }],
  };
}

describe('SupportSessionsService', () => {
  let service: SupportSessionsService;
  let db: any;
  let audit: any;
  let jwt: any;

  beforeEach(async () => {
    db = {
      user: { findFirst: jest.fn() },
      platformSupportSession: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn(),
      },
    };
    audit = { log: jest.fn().mockResolvedValue(true) };
    jwt = { sign: jest.fn().mockReturnValue('jwt-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupportSessionsService,
        { provide: DatabaseService, useValue: db },
        { provide: AuditService, useValue: audit },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();
    service = module.get(SupportSessionsService);
  });

  it('rejects weak or missing reasons', async () => {
    await expect(service.createSession('org-1', 'user-1', 'no', 'admin-1')).rejects.toThrow(BadRequestException);
  });

  it('rejects targets outside the requested tenant', async () => {
    db.user.findFirst.mockResolvedValue(null);
    await expect(
      service.createSession('org-1', 'user-2', 'Investigate reported issue', 'admin-1'),
    ).rejects.toThrow('Active target user was not found in this tenant');
  });

  it('creates a hashed, time-bound support session and returns the raw token once', async () => {
    db.user.findFirst.mockResolvedValue(targetUser());
    db.platformSupportSession.create.mockResolvedValue({
      ...session,
      organization: { id: 'org-1', name: 'School Group', slug: 'school-group' },
      targetUser: { id: 'user-1', email: 'admin@school.test', firstName: 'School', lastName: 'Admin' },
    });

    const result = await service.createSession('org-1', 'user-1', 'Investigate reported issue', 'admin-1', 30);
    expect(result.supportToken).toBeDefined();
    expect(result.supportToken).not.toBe(session.sessionToken);
    expect(db.platformSupportSession.create.mock.calls[0][0].data.sessionToken).toHaveLength(64);
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'platform.support_session.created' }));
  });

  it('exchanges only active, unexpired tokens into an impersonation JWT', async () => {
    db.platformSupportSession.findUnique.mockResolvedValue({
      ...session,
      targetUser: targetUser(),
    });

    const result = await service.exchangeToken('A'.repeat(48));
    expect(result).toEqual(expect.objectContaining({ access_token: 'jwt-token', impersonation: true }));
    expect(jwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: 'user-1',
        org: 'org-1',
        impersonation: true,
        impersonatorUserId: 'admin-1',
      }),
      expect.anything(),
    );
  });

  it('rejects an expired support session', async () => {
    db.platformSupportSession.findUnique.mockResolvedValue({
      ...session,
      expiresAt: new Date(Date.now() - 1),
      targetUser: targetUser(),
    });
    await expect(service.exchangeToken('A'.repeat(48))).rejects.toThrow(UnauthorizedException);
  });

  it('prevents another superadmin from ending the session', async () => {
    db.platformSupportSession.findUnique.mockResolvedValue(session);
    await expect(service.endSession('session-1', 'different-admin')).rejects.toThrow(ForbiddenException);
  });
});
