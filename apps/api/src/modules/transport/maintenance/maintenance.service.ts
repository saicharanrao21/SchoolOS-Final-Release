import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';

@Injectable()
export class TransportMaintenanceService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createMaintenance(organizationId: string, data: any, actorId: string) {
    const maintenance = await this.db.transportMaintenance.create({
      data: {
        vehicleId: data.vehicleId,
        maintenanceType: data.maintenanceType || 'PREVENTIVE',
        description: data.description,
        vendor: data.vendor,
        cost: new Prisma.Decimal(data.cost || 0),
        scheduledDate: new Date(data.scheduledDate),
        completedDate: data.completedDate ? new Date(data.completedDate) : null,
        odometer: data.odometer,
        status: data.status || 'SCHEDULED',
        nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : null,
        organizationId,
        schoolId: data.schoolId,
      },
    });

    if (data.odometer) {
      await this.db.vehicle.update({
        where: { id: data.vehicleId },
        data: { odometer: data.odometer },
      });
    }

    await this.audit.log({
      action: 'transport.maintenance.create',
      resource: 'TransportMaintenance',
      resourceId: maintenance.id,
      actorId,
      organizationId,
      schoolId: data.schoolId,
    });

    this.eventEmitter.emit('transport.maintenance.created', {
      maintenanceId: maintenance.id,
      vehicleId: data.vehicleId,
      schoolId: data.schoolId,
      organizationId,
    });

    return maintenance;
  }

  async updateMaintenanceStatus(organizationId: string, id: string, status: string, actorId: string, completedDate?: string) {
    const maintenance = await this.db.transportMaintenance.findUnique({
      where: { id },
      include: { vehicle: true },
    });

    if (!maintenance) throw new NotFoundException('Maintenance record not found');

    const updated = await this.db.transportMaintenance.update({
      where: { id },
      data: {
        status,
        completedDate: completedDate ? new Date(completedDate) : status === 'COMPLETED' ? new Date() : maintenance.completedDate,
      },
    });

    await this.audit.log({
      action: 'transport.maintenance.update_status',
      resource: 'TransportMaintenance',
      resourceId: id,
      actorId,
      organizationId,
      schoolId: maintenance.schoolId,
      metadata: { status },
    });

    return updated;
  }

  async findBySchool(schoolId: string) {
    return this.db.transportMaintenance.findMany({
      where: { schoolId },
      include: { vehicle: true },
      orderBy: { scheduledDate: 'desc' },
    });
  }

  async getComplianceSummary(schoolId: string) {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const vehicles = await this.db.vehicle.findMany({
      where: { schoolId, status: 'ACTIVE' },
      include: {
        maintenances: { where: { status: { in: ['SCHEDULED', 'IN_PROGRESS'] } } },
        documents: true,
      },
    });

    const expiringDocuments = vehicles.flatMap(v =>
      v.documents.filter(d => d.expiryDate && d.expiryDate <= thirtyDaysFromNow)
    );

    const expiredVehicles = vehicles.filter(v =>
      (v.insuranceExpiry && v.insuranceExpiry <= today) ||
      (v.permitExpiry && v.permitExpiry <= today) ||
      (v.fitnessExpiry && v.fitnessExpiry <= today) ||
      (v.pollutionExpiry && v.pollutionExpiry <= today)
    );

    return {
      totalActiveVehicles: vehicles.length,
      vehiclesNeedingMaintenance: vehicles.filter(v => v.maintenances.length > 0).length,
      expiringDocumentsCount: expiringDocuments.length,
      expiredVehiclesCount: expiredVehicles.length,
      expiredVehicles,
    };
  }
}
