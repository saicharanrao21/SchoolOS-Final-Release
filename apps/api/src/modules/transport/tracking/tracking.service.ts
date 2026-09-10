import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TripStatus } from '@prisma/client';

const SCHOOL_BUS_SAFETY_SPEED_KPH = 80;
const EARTH_RADIUS_M = 6_371_000;

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
    private readonly events: EventEmitter2,
  ) {}

  async updateLocation(organizationId: string, tripId: string, data: any, actorId: string) {
    const latitude = Number(data.latitude);
    const longitude = Number(data.longitude);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      throw new BadRequestException('A valid latitude is required');
    }
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      throw new BadRequestException('A valid longitude is required');
    }

    const trip = await this.db.transportTrip.findFirst({
      where: { id: tripId, route: { school: { organizationId } } },
      include: { route: { include: { stops: { where: { isActive: true }, orderBy: { sequence: 'asc' } }, school: true } }, vehicle: true },
    });
    if (!trip) throw new NotFoundException('Trip not found in the current organization');
    if (trip.status === TripStatus.COMPLETED) return { success: false, message: 'Trip is not active' };

    const location = await this.db.vehicleLocation.create({
      data: {
        tripId,
        latitude,
        longitude,
        speed: data.speed == null ? undefined : Number(data.speed),
        heading: data.heading == null ? undefined : Number(data.heading),
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      },
    });

    const policy = await this.db.transportPolicy.findFirst({ where: { schoolId: trip.route.schoolId } });
    const alerts: Array<{ type: string; severity: string; distanceMeters?: number }> = [];

    const nearestStop = trip.route.stops.reduce<{ distance: number; stopId: string } | null>((best, stop) => {
      const distance = this.distanceMeters(latitude, longitude, stop.latitude, stop.longitude);
      return !best || distance < best.distance ? { distance, stopId: stop.id } : best;
    }, null);

    const deviationLimit = policy?.routeDeviationThresholdMeters ?? 500;
    if (nearestStop && nearestStop.distance > deviationLimit) {
      alerts.push({ type: 'DEVIATION', severity: nearestStop.distance > deviationLimit * 2 ? 'HIGH' : 'MEDIUM', distanceMeters: Math.round(nearestStop.distance) });
    }

    const speed = data.speed == null ? null : Number(data.speed);
    if (speed != null && Number.isFinite(speed) && speed > SCHOOL_BUS_SAFETY_SPEED_KPH) {
      alerts.push({ type: 'OVER_SPEEDING', severity: speed > SCHOOL_BUS_SAFETY_SPEED_KPH * 1.25 ? 'HIGH' : 'MEDIUM' });
    }

    for (const alert of alerts) {
      const existing = await this.db.transportSafetyIncident.findFirst({
        where: { tripId, type: alert.type, status: 'OPEN' },
      });
      if (existing) continue;

      const incident = await this.db.transportSafetyIncident.create({
        data: {
          tripId,
          type: alert.type,
          severity: alert.severity,
          description: alert.type === 'DEVIATION'
            ? `Vehicle is approximately ${alert.distanceMeters}m from the nearest active route stop.`
            : `Vehicle speed exceeded the ${SCHOOL_BUS_SAFETY_SPEED_KPH} km/h safety threshold.`,
          latitude,
          longitude,
          status: 'OPEN',
        },
      });
      await this.audit.log({
        action: `transport.safety.${alert.type.toLowerCase()}`,
        resource: 'TransportSafetyIncident',
        resourceId: incident.id,
        actorId,
        organizationId,
        schoolId: trip.route.schoolId,
        metadata: { tripId, vehicleId: trip.vehicleId, ...alert },
      });
      this.events.emit('transport.safety.incident', {
        organizationId,
        schoolId: trip.route.schoolId,
        tripId,
        incidentId: incident.id,
        type: alert.type,
        severity: alert.severity,
      });
    }

    this.events.emit('transport.location.updated', {
      organizationId,
      schoolId: trip.route.schoolId,
      tripId,
      vehicleId: trip.vehicleId,
      latitude,
      longitude,
      speed,
      heading: data.heading,
      occurredAt: location.timestamp,
    });

    this.logger.log(`GPS Update for Trip ${tripId}: ${latitude}, ${longitude}`);
    return { success: true, location, safety: { alertsGenerated: alerts.length, nearestStopDistanceMeters: nearestStop ? Math.round(nearestStop.distance) : null } };
  }

  async getLatestLocation(organizationId: string, tripId: string) {
    await this.assertTrip(organizationId, tripId);
    return this.db.vehicleLocation.findFirst({ where: { tripId }, orderBy: { timestamp: 'desc' } });
  }

  async getTripPath(organizationId: string, tripId: string) {
    await this.assertTrip(organizationId, tripId);
    return this.db.vehicleLocation.findMany({ where: { tripId }, orderBy: { timestamp: 'asc' } });
  }

  async listIncidents(organizationId: string, schoolId: string, status?: string) {
    await this.assertSchool(organizationId, schoolId);
    return this.db.transportSafetyIncident.findMany({
      where: { trip: { route: { schoolId, school: { organizationId } } }, ...(status ? { status } : {}) },
      include: { trip: { include: { route: true, vehicle: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async resolveIncident(organizationId: string, incidentId: string, actorId: string, resolution?: string) {
    const incident = await this.db.transportSafetyIncident.findFirst({
      where: { id: incidentId, trip: { route: { school: { organizationId } } } },
      include: { trip: { include: { route: true } } },
    });
    if (!incident) throw new NotFoundException('Safety incident not found');
    if (incident.status === 'RESOLVED') return incident;

    const updated = await this.db.transportSafetyIncident.update({
      where: { id: incidentId },
      data: { status: 'RESOLVED', description: resolution?.trim() ? `${incident.description ?? ''}\nResolution: ${resolution.trim()}` : incident.description },
    });
    await this.audit.log({
      action: 'transport.safety.incident.resolved',
      resource: 'TransportSafetyIncident',
      resourceId: incidentId,
      actorId,
      organizationId,
      schoolId: incident.trip.route.schoolId,
      metadata: { resolution: resolution?.trim() || null },
    });
    return updated;
  }

  async getSafetySummary(organizationId: string, schoolId: string) {
    await this.assertSchool(organizationId, schoolId);
    const [open, critical, today] = await Promise.all([
      this.db.transportSafetyIncident.count({ where: { status: 'OPEN', trip: { route: { schoolId, school: { organizationId } } } } }),
      this.db.transportSafetyIncident.count({ where: { severity: 'CRITICAL', status: 'OPEN', trip: { route: { schoolId, school: { organizationId } } } } }),
      this.db.transportSafetyIncident.count({ where: { createdAt: { gte: this.startOfToday() }, trip: { route: { schoolId, school: { organizationId } } } } }),
    ]);
    return { open, critical, today };
  }

  private async assertTrip(organizationId: string, tripId: string) {
    const trip = await this.db.transportTrip.findFirst({ where: { id: tripId, route: { school: { organizationId } } }, select: { id: true } });
    if (!trip) throw new NotFoundException('Trip not found in the current organization');
  }

  private async assertSchool(organizationId: string, schoolId: string) {
    const school = await this.db.school.findFirst({ where: { id: schoolId, organizationId }, select: { id: true } });
    if (!school) throw new ForbiddenException('School is not part of the current organization');
  }

  private distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * EARTH_RADIUS_M * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private startOfToday() { const date = new Date(); date.setHours(0, 0, 0, 0); return date; }
}
