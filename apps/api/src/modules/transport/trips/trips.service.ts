import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma, TripStatus, BoardingStatus } from '@prisma/client';

@Injectable()
export class TripsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createTrip(organizationId: string, data: any, actorId: string) {
    const trip = await this.db.transportTrip.create({
      data: {
        routeId: data.routeId,
        vehicleId: data.vehicleId,
        driverId: data.driverId,
        conductorId: data.conductorId,
        date: new Date(data.date || new Date()),
        direction: data.direction,
        status: TripStatus.PLANNED,
      },
    });

    await this.audit.log({
      action: 'transport.trip.create',
      resource: 'TransportTrip',
      resourceId: trip.id,
      actorId,
      organizationId,
    });

    return trip;
  }

  async startTrip(organizationId: string, id: string, actorId: string) {
    const trip = await this.db.transportTrip.findUnique({
      where: { id },
      include: { route: true },
    });

    if (!trip) throw new NotFoundException('Trip not found');

    const updated = await this.db.transportTrip.update({
      where: { id },
      data: { status: TripStatus.STARTED, startedAt: new Date() },
    });

    this.eventEmitter.emit('trip.started', {
      organizationId,
      schoolId: trip.route.schoolId,
      tripId: id,
      routeId: trip.routeId,
    });

    return updated;
  }

  async boardStudent(organizationId: string, tripId: string, data: any, actorId: string) {
    return this.db.$transaction(async (tx: Prisma.TransactionClient) => {
      const event = await tx.boardingEvent.create({
        data: {
          tripId,
          studentId: data.studentId,
          stopId: data.stopId,
          type: 'BOARDING',
          status: BoardingStatus.BOARDED,
          latitude: data.latitude,
          longitude: data.longitude,
          verifiedById: actorId,
        },
      });

      const trip = await tx.transportTrip.findUnique({
        where: { id: tripId },
        include: { route: true },
      });

      this.eventEmitter.emit('student.boarded', {
        organizationId,
        schoolId: trip?.route.schoolId,
        studentId: data.studentId,
        tripId,
      });

      return event;
    });
  }

  async deboardStudent(organizationId: string, tripId: string, data: any, actorId: string) {
    return this.db.$transaction(async (tx: Prisma.TransactionClient) => {
      const event = await tx.boardingEvent.create({
        data: {
          tripId,
          studentId: data.studentId,
          stopId: data.stopId,
          type: 'DEBOARDING',
          status: BoardingStatus.BOARDED, // Means successfully deboarded here
          latitude: data.latitude,
          longitude: data.longitude,
          verifiedById: actorId,
        },
      });

      const trip = await tx.transportTrip.findUnique({
        where: { id: tripId },
        include: { route: true },
      });

      this.eventEmitter.emit('student.deboarded', {
        organizationId,
        schoolId: trip?.route.schoolId,
        studentId: data.studentId,
        tripId,
      });

      return event;
    });
  }

  async completeTrip(organizationId: string, id: string, actorId: string) {
    const trip = await this.db.transportTrip.update({
      where: { id },
      data: { status: TripStatus.COMPLETED, completedAt: new Date() },
    });

    return trip;
  }

  async findActiveTrips(organizationId: string, schoolId: string) {
    return this.db.transportTrip.findMany({
      where: {
        route: { schoolId, school: { organizationId } },
        status: { in: [TripStatus.STARTED, TripStatus.IN_PROGRESS, TripStatus.ARRIVED] },
      },
      include: {
        route: true,
        vehicle: true,
        driver: { select: { firstName: true, lastName: true } },
      },
    });
  }
}
