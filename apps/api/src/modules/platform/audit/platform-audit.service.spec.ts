import { PlatformAuditService } from './platform-audit.service';

describe('PlatformAuditService', () => {
  it('always scopes audit searches to the authenticated organization', async () => {
    const db: any = {
      auditEvent: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
      $transaction: jest.fn().mockImplementation((ops) => Promise.all(ops)),
    };
    const service = new PlatformAuditService(db);
    await service.search('org-a', { schoolId: 'school-a', action: 'login' });
    expect(db.auditEvent.findMany.mock.calls[0][0].where).toEqual(expect.objectContaining({ organizationId: 'org-a', schoolId: 'school-a' }));
  });

  it('returns operational severity summary', async () => {
    const db: any = { auditEvent: { count: jest.fn().mockResolvedValueOnce(100).mockResolvedValueOnce(2).mockResolvedValueOnce(8).mockResolvedValueOnce(20) } };
    const service = new PlatformAuditService(db);
    await expect(service.summary('org-a')).resolves.toEqual({ total: 100, critical: 2, high: 8, today: 20 });
  });
});
