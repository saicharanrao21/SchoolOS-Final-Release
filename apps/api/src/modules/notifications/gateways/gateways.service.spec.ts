import { BadRequestException, NotFoundException } from '@nestjs/common';
import { NotificationChannel } from '@prisma/client';
import { NotificationGatewaysService } from './gateways.service';

const db: any = {
  notificationProvider: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(async (arg: any) => {
    if (Array.isArray(arg)) return Promise.all(arg);
    return arg(db);
  }),
};
const audit: any = { log: jest.fn() };

describe('NotificationGatewaysService', () => {
  let service: NotificationGatewaysService;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NOTIFICATION_CONFIG_ENCRYPTION_KEY = 'schoolos-test-key';
    service = new NotificationGatewaysService(db, audit);
  });

  it('exposes the provider catalogue and filters by channel', () => {
    const all = service.catalog();
    const sms = service.catalog(NotificationChannel.SMS);
    expect(all.length).toBeGreaterThanOrEqual(30);
    expect(sms.every((p) => p.channels.includes(NotificationChannel.SMS))).toBe(true);
  });

  it('rejects incomplete gateway credentials', async () => {
    await expect(service.create('org-1', 'school-1', 'user-1', {
      providerKey: 'MSG91',
      channel: NotificationChannel.SMS,
      config: { authKey: 'secret' },
    })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('stores credentials encrypted and returns only masked configuration', async () => {
    db.notificationProvider.create.mockImplementation((args: any) => ({
      ...args.data,
      id: 'gateway-1',
    }));
    const result = await service.create('org-1', 'school-1', 'user-1', {
      providerKey: 'MSG91',
      channel: NotificationChannel.SMS,
      config: { authKey: 'secret', senderId: 'SCHOOL', templateId: 'tpl-1' },
      isDefault: true,
    });
    const createCall = db.notificationProvider.create.mock.calls[0][0];
    expect(typeof createCall.data.config).toBe('string');
    expect(createCall.data.config).not.toContain('secret');
    expect(result.config).toEqual({ configured: true, encrypted: true });
    expect(audit.log).toHaveBeenCalled();
  });

  it('rejects access to a gateway outside the caller school/organization', async () => {
    db.notificationProvider.findFirst.mockResolvedValue(null);
    await expect(service.inspect('org-a', 'school-a', 'gateway-b'))
      .rejects.toBeInstanceOf(NotFoundException);
  });
});
