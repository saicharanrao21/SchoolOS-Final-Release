import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RoutesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async createRoute(organizationId: string, data: any, actorId: string) {
    const school = await this.db.school.findFirst({
      where: { id: data.schoolId, organizationId },
    });
    if (!school) throw new NotFoundException('School not found');

    const route = await this.db.transportRoute.create({
      data: {
        name: data.name,
        code: data.code,
        direction: data.direction,
        schoolId: data.schoolId,
        stops: {
          create: data.stops?.map((stop: any) => ({
            name: stop.name,
            sequence: stop.sequence,
            latitude: stop.latitude,
            longitude: stop.longitude,
            address: stop.address,
            plannedTime: stop.plannedTime,
            pickupEnabled: stop.pickupEnabled ?? true,
            dropoffEnabled: stop.dropoffEnabled ?? true,
          })),
        },
      },
      include: { stops: { orderBy: { sequence: 'asc' } } },
    });

    await this.audit.log({
      action: 'transport.route.create',
      resource: 'TransportRoute',
      resourceId: route.id,
      actorId,
      organizationId,
      schoolId: data.schoolId,
    });

    return route;
  }

  async findAllRoutes(organizationId: string, schoolId: string) {
    return this.db.transportRoute.findMany({
      where: { schoolId, school: { organizationId } },
      include: { stops: { orderBy: { sequence: 'asc' } }, _count: { select: { assignments: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOneRoute(organizationId: string, id: string) {
    const route = await this.db.transportRoute.findFirst({
      where: { id, school: { organizationId } },
      include: { stops: { orderBy: { sequence: 'asc' } } },
    });
    if (!route) throw new NotFoundException('Route not found');
    return route;
  }

  async updateRoute(organizationId: string, id: string, data: any, actorId: string) {
    const route = await this.findOneRoute(organizationId, id);

    return this.db.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Update Route Details
      const updated = await tx.transportRoute.update({
        where: { id },
        data: {
          name: data.name,
          code: data.code,
          direction: data.direction,
          isActive: data.isActive,
        },
      });

      // 2. Sync Stops (Simple way: recreate if provided)
      if (data.stops) {
        await tx.transportStop.deleteMany({ where: { routeId: id } });
        await tx.transportStop.createMany({
          data: data.stops.map((stop: any) => ({
            routeId: id,
            name: stop.name,
            sequence: stop.sequence,
            latitude: stop.latitude,
            longitude: stop.longitude,
            address: stop.address,
            plannedTime: stop.plannedTime,
          })),
        });
      }

      await this.audit.log({
        action: 'transport.route.update',
        resource: 'TransportRoute',
        resourceId: id,
        actorId,
        organizationId,
        schoolId: route.schoolId,
      });

      return updated;
    });
  }
}
