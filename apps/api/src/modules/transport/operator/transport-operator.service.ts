import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TripStatus, BoardingStatus, RouteDirection } from '@prisma/client';

@Injectable()
export class TransportOperatorService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getOperatorProfile(userId: string) {
    const employee = await this.db.employee.findUnique({
      where: { userId },
      include: {
        driverProfile: true,
        school: true,
      },
    });

    if (!employee) throw new NotFoundException('Operator profile not found');
    return employee;
  }

  async getDashboard(userId: string) {
    const employee = await this.getOperatorProfile(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeTrip = await this.db.transportTrip.findFirst({
      where: {
        OR: [
          { driverId: employee.id },
          { conductorId: employee.id }
        ],
        date: { gte: today },
        status: { in: [TripStatus.PLANNED, TripStatus.STARTED, TripStatus.IN_PROGRESS, TripStatus.ARRIVED] },
      },
      include: {
        route: { include: { stops: { orderBy: { sequence: 'asc' } } } },
        vehicle: true,
      },
      orderBy: { date: 'asc' },
    });

    return {
      profile: {
        firstName: employee.firstName,
        lastName: employee.lastName,
        employeeId: employee.employeeId,
      },
      activeTrip,
      todayDate: today.toISOString(),
    };
  }

  async verifyOperatorAccess(userId: string, tripId: string) {
    const trip = await this.db.transportTrip.findUnique({
      where: { id: tripId },
    });

    if (!trip) throw new NotFoundException('Trip not found');

    const employee = await this.db.employee.findUnique({ where: { userId } });
    if (!employee || (trip.driverId !== employee.id && trip.conductorId !== employee.id)) {
      throw new ForbiddenException('You are not assigned to this trip');
    }

    return { trip, employee };
  }

  async startTrip(userId: string, tripId: string) {
    const { trip } = await this.verifyOperatorAccess(userId, tripId);

    if (trip.status !== TripStatus.PLANNED) {
      throw new BadRequestException('Trip already started or completed');
    }

    const updated = await this.db.transportTrip.update({
      where: { id: tripId },
      data: { status: TripStatus.STARTED, startedAt: new Date() },
    });

    this.eventEmitter.emit('trip.started', {
      organizationId: updated.routeId,
      tripId,
    });

    return updated;
  }

  async recordBoarding(userId: string, tripId: string, data: any) {
    await this.verifyOperatorAccess(userId, tripId);

    const event = await this.db.boardingEvent.create({
      data: {
        tripId,
        studentId: data.studentId,
        stopId: data.stopId,
        type: 'BOARDING',
        status: BoardingStatus.BOARDED,
        latitude: data.latitude,
        longitude: data.longitude,
        verifiedById: userId,
      },
    });

    this.eventEmitter.emit('student.boarded', {
       studentId: data.studentId,
       tripId,
    });

    return event;
  }

  async recordDeboarding(userId: string, tripId: string, data: any) {
    await this.verifyOperatorAccess(userId, tripId);

    const event = await this.db.boardingEvent.create({
      data: {
        tripId,
        studentId: data.studentId,
        stopId: data.stopId,
        type: 'DEBOARDING',
        status: BoardingStatus.BOARDED,
        latitude: data.latitude,
        longitude: data.longitude,
        verifiedById: userId,
      },
    });

    this.eventEmitter.emit('student.deboarded', {
       studentId: data.studentId,
       tripId,
    });

    return event;
  }

  async reportIncident(userId: string, tripId: string, data: any) {
    const { employee } = await this.verifyOperatorAccess(userId, tripId);

    const incident = await this.db.transportSafetyIncident.create({
      data: {
        tripId,
        type: data.type,
        severity: data.severity,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
      },
    });

    this.eventEmitter.emit('transport.incident', {
      tripId,
      incidentId: incident.id,
      severity: data.severity,
    });

    return incident;
  }

  async triggerSos(userId: string, tripId: string, data: any) {
    const { employee } = await this.verifyOperatorAccess(userId, tripId);

    const incident = await this.db.transportSafetyIncident.create({
      data: {
        tripId,
        type: 'SOS',
        severity: 'CRITICAL',
        description: 'Emergency SOS triggered from driver app',
        latitude: data.latitude,
        longitude: data.longitude,
      },
    });

    this.eventEmitter.emit('transport.emergency', {
      tripId,
      incidentId: incident.id,
    });

    return incident;
  }

  async completeTrip(userId: string, tripId: string) {
    await this.verifyOperatorAccess(userId, tripId);

    const updated = await this.db.transportTrip.update({
      where: { id: tripId },
      data: { status: TripStatus.COMPLETED, completedAt: new Date() },
    });

    return updated;
  }

  async updateLocation(userId: string, tripId: string, data: any) {
    const { trip } = await this.verifyOperatorAccess(userId, tripId);

    if (trip.status === TripStatus.COMPLETED) {
      throw new BadRequestException('Cannot update location for a completed trip');
    }

    const location = await this.db.vehicleLocation.create({
      data: {
        tripId,
        latitude: data.latitude,
        longitude: data.longitude,
        speed: data.speed,
        heading: data.heading,
        timestamp: new Date(),
      },
    });

    return location;
  }

  async getTripManifest(userId: string, tripId: string) {
    const { trip } = await this.verifyOperatorAccess(userId, tripId);

    const assignments = await this.db.studentTransportAssignment.findMany({
      where: { routeId: trip.routeId, status: 'ACTIVE' },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } },
        stop: true,
      },
    });

    const boardingEvents = await this.db.boardingEvent.findMany({
      where: { tripId },
    });

    return assignments.map(a => {
      const events = boardingEvents.filter(e => e.studentId === a.studentId);
      return {
        ...a,
        boardingStatus: events.find(e => e.type === 'BOARDING')?.status || 'NOT_BOARDED',
        deboardingStatus: events.find(e => e.type === 'DEBOARDING')?.status || 'NOT_DEBOARDED',
      };
    });
  }

  async recordInspection(userId: string, tripId: string, data: any) {
    const { trip, employee } = await this.verifyOperatorAccess(userId, tripId);

    const inspection = await this.db.vehicleInspection.create({
      data: {
        tripId,
        vehicleId: trip.vehicleId,
        inspectorId: employee.id,
        checklist: data.checklist,
        passed: data.passed,
        notes: data.notes,
      },
    });

    return inspection;
  }
}
