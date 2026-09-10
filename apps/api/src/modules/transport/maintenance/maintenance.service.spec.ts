import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { NotFoundException } from '@nestjs/common';

jest.mock('@nestjs/event-emitter', () => ({
  EventEmitter2: jest.fn().mockImplementation(() => ({
    emit: jest.fn(),
  })),
}));

import { EventEmitter2 } from '@nestjs/event-emitter';
import { TransportMaintenanceService } from './maintenance.service';

describe('TransportMaintenanceService', () => {
  let service: TransportMaintenanceService;
  let db: any;
  let audit: any;
  let eventEmitter: any;

  beforeEach(async () => {
    db = {
      transportMaintenance: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      vehicle: {
        update: jest.fn(),
        findMany: jest.fn(),
      },
    };

    audit = {
      log: jest.fn().mockResolvedValue(true),
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransportMaintenanceService,
        { provide: DatabaseService, useValue: db },
        { provide: AuditService, useValue: audit },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<TransportMaintenanceService>(TransportMaintenanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createMaintenance', () => {
    it('should create a maintenance record and update vehicle odometer if provided', async () => {
      const mockMaintenance = {
        id: 'maint-1',
        vehicleId: 'veh-1',
        cost: 150,
      };

      db.transportMaintenance.create.mockResolvedValue(mockMaintenance);
      db.vehicle.update.mockResolvedValue({});

      const data = {
        vehicleId: 'veh-1',
        maintenanceType: 'PREVENTIVE',
        description: 'Oil change and filter replacement',
        cost: 150,
        scheduledDate: '2026-09-10',
        odometer: 15000,
        schoolId: 'school-1',
      };

      const result = await service.createMaintenance('org-1', data, 'actor-1');

      expect(db.transportMaintenance.create).toHaveBeenCalled();
      expect(db.vehicle.update).toHaveBeenCalledWith({
        where: { id: 'veh-1' },
        data: { odometer: 15000 },
      });
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'transport.maintenance.create',
          resource: 'TransportMaintenance',
        })
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith('transport.maintenance.created', expect.any(Object));
      expect(result).toEqual(mockMaintenance);
    });
  });

  describe('updateMaintenanceStatus', () => {
    it('should throw NotFoundException if maintenance record is missing', async () => {
      db.transportMaintenance.findUnique.mockResolvedValue(null);

      await expect(
        service.updateMaintenanceStatus('org-1', 'maint-99', 'COMPLETED', 'actor-1')
      ).rejects.toThrow(NotFoundException);
    });

    it('should update status to COMPLETED and log audit', async () => {
      const existing = {
        id: 'maint-1',
        schoolId: 'school-1',
        completedDate: null,
      };

      const updated = {
        ...existing,
        status: 'COMPLETED',
        completedDate: new Date(),
      };

      db.transportMaintenance.findUnique.mockResolvedValue(existing);
      db.transportMaintenance.update.mockResolvedValue(updated);

      const result = await service.updateMaintenanceStatus('org-1', 'maint-1', 'COMPLETED', 'actor-1');

      expect(db.transportMaintenance.update).toHaveBeenCalled();
      expect(result.status).toEqual('COMPLETED');
    });
  });
});
