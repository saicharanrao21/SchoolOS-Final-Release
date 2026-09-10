import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { Prisma, VehicleStatus } from '@prisma/client';

@Injectable()
export class VehiclesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async create(organizationId: string, data: any, actorId: string) {
    const school = await this.db.school.findFirst({
      where: { id: data.schoolId, organizationId },
    });
    if (!school) throw new NotFoundException('School not found');

    const vehicle = await this.db.vehicle.create({
      data: {
        vehicleNumber: data.vehicleNumber,
        registrationNumber: data.registrationNumber,
        type: data.type,
        capacity: data.capacity,
        make: data.make,
        model: data.model,
        year: data.year,
        fuelType: data.fuelType,
        gpsDeviceId: data.gpsDeviceId,
        schoolId: data.schoolId,
        status: VehicleStatus.ACTIVE,
        documents: {
          create: data.documents?.map((doc: any) => ({
            type: doc.type,
            documentNumber: doc.documentNumber,
            expiryDate: new Date(doc.expiryDate),
            fileUrl: doc.fileUrl,
          })),
        },
      },
      include: { documents: true },
    });

    await this.audit.log({
      action: 'transport.vehicle.create',
      resource: 'Vehicle',
      resourceId: vehicle.id,
      actorId,
      organizationId,
      schoolId: data.schoolId,
    });

    return vehicle;
  }

  async findAll(organizationId: string, filters: any) {
    return this.db.vehicle.findMany({
      where: {
        school: { organizationId },
        schoolId: filters.schoolId,
        status: filters.status,
      },
      include: { documents: true, _count: { select: { trips: true } } },
      orderBy: { vehicleNumber: 'asc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const vehicle = await this.db.vehicle.findFirst({
      where: { id, school: { organizationId } },
      include: { documents: true, trips: { take: 5, orderBy: { date: 'desc' } } },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return vehicle;
  }

  async update(organizationId: string, id: string, data: any, actorId: string) {
    const vehicle = await this.findOne(organizationId, id);

    const updated = await this.db.vehicle.update({
      where: { id },
      data: {
        vehicleNumber: data.vehicleNumber,
        type: data.type,
        capacity: data.capacity,
        status: data.status,
        gpsDeviceId: data.gpsDeviceId,
      },
    });

    await this.audit.log({
      action: 'transport.vehicle.update',
      resource: 'Vehicle',
      resourceId: id,
      actorId,
      organizationId,
      schoolId: vehicle.schoolId,
    });

    return updated;
  }
}
