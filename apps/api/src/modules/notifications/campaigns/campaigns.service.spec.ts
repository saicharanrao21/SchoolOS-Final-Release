import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { BadRequestException } from '@nestjs/common';
import { CampaignStatus, NotificationChannel } from '@prisma/client';

jest.mock('@nestjs/event-emitter', () => ({
  EventEmitter2: jest.fn().mockImplementation(() => ({
    emit: jest.fn(),
  })),
  OnEvent: jest.fn().mockImplementation(() => jest.fn()),
}));

import { NotificationOrchestratorService } from '../orchestrator/notification-orchestrator.service';
import { CampaignsService } from './campaigns.service';

describe('CampaignsService', () => {
  let service: CampaignsService;
  let db: any;
  let audit: any;
  let orchestrator: any;

  beforeEach(async () => {
    db = {
      communicationCampaign: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        aggregate: jest.fn(),
      },
      campaignRecipient: {
        upsert: jest.fn(),
      },
      notification: {
        create: jest.fn(),
      },
      school: { findFirst: jest.fn().mockResolvedValue({ id: 'school-1', organizationId: 'org-1' }) },
      user: {
        findMany: jest.fn(),
      },
      student: {
        findMany: jest.fn(),
      },
    };

    audit = {
      log: jest.fn().mockResolvedValue(true),
    };

    orchestrator = {
      handleEvent: jest.fn().mockResolvedValue(true),
      dispatch: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignsService,
        { provide: DatabaseService, useValue: db },
        { provide: AuditService, useValue: audit },
        { provide: NotificationOrchestratorService, useValue: orchestrator },
      ],
    }).compile();

    service = module.get<CampaignsService>(CampaignsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCampaign', () => {
    it('should create a campaign in DRAFT status', async () => {
      const mockCampaign = {
        id: 'camp-1',
        title: 'Weather Warning',
        status: CampaignStatus.DRAFT,
      };

      db.communicationCampaign.create.mockResolvedValue(mockCampaign);

      const data = {
        title: 'Weather Warning',
        body: 'School will be closed due to rain.',
        targetAudience: 'ALL_SCHOOL',
        schoolId: 'school-1',
      };

      const result = await service.createCampaign('org-1', data, 'user-1');

      expect(db.communicationCampaign.create).toHaveBeenCalled();
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'communications.campaign.create',
          resource: 'CommunicationCampaign',
        })
      );
      expect(result).toEqual(mockCampaign);
    });
  });

  describe('executeCampaign', () => {
    it('should throw BadRequestException if campaign is missing or completed', async () => {
      db.communicationCampaign.findFirst.mockResolvedValue({
        id: 'camp-1',
        status: CampaignStatus.COMPLETED,
      });

      await expect(
        service.executeCampaign('org-1', 'camp-1', 'user-1')
      ).rejects.toThrow(BadRequestException);
    });

    it('should resolve recipients and broadcast messages', async () => {
      const mockCampaign = {
        id: 'camp-1',
        title: 'School Event',
        body: 'Join annual day',
        status: CampaignStatus.DRAFT,
        schoolId: 'school-1',
        targetAudience: 'ALL_SCHOOL',
        targetRoles: [],
        targetClasses: [],
        channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
      };

      db.communicationCampaign.findFirst.mockResolvedValue(mockCampaign);
      db.communicationCampaign.update.mockResolvedValue({ ...mockCampaign, status: CampaignStatus.COMPLETED });
      db.user.findMany.mockResolvedValue([{ id: 'usr-1', email: 'a@b.com' }, { id: 'usr-2', email: 'c@d.com' }]);
      db.campaignRecipient.upsert.mockResolvedValue({});
      db.notification.create.mockResolvedValue({});

      const result = await service.executeCampaign('org-1', 'camp-1', 'user-1');

      expect(db.communicationCampaign.update).toHaveBeenCalled();
      expect(db.user.findMany).toHaveBeenCalled();
      expect(db.notification.create).toHaveBeenCalledTimes(4); // 2 users * 2 channels
      expect(result.status).toEqual(CampaignStatus.COMPLETED);
    });
  });
});
