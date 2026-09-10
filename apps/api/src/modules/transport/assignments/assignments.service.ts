import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class StudentAssignmentsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async assign(organizationId: string, data: any, actorId: string) {
    const student = await this.db.student.findFirst({
      where: { id: data.studentId, school: { organizationId } },
    });
    if (!student) throw new NotFoundException('Student not found');

    const route = await this.db.transportRoute.findUnique({
      where: { id: data.routeId },
    });
    if (!route) throw new NotFoundException('Route not found');

    // Capacity Check
    const vehicle = await this.db.vehicle.findFirst({
      where: { trips: { some: { routeId: data.routeId } } },
    });
    if (vehicle) {
       const assignedCount = await this.db.studentTransportAssignment.count({
         where: { routeId: data.routeId, status: 'ACTIVE' },
       });
       if (assignedCount >= vehicle.capacity) {
         throw new BadRequestException('Vehicle capacity exceeded for this route');
       }
    }

    const assignment = await this.db.studentTransportAssignment.upsert({
      where: { studentId: data.studentId },
      update: {
        routeId: data.routeId,
        stopId: data.stopId,
        academicYearId: data.academicYearId,
        pickup: data.pickup ?? true,
        dropoff: data.dropoff ?? true,
        status: 'ACTIVE',
      },
      create: {
        studentId: data.studentId,
        routeId: data.routeId,
        stopId: data.stopId,
        academicYearId: data.academicYearId,
        pickup: data.pickup ?? true,
        dropoff: data.dropoff ?? true,
      },
    });

    await this.audit.log({
      action: 'transport.assignment.create',
      resource: 'StudentTransportAssignment',
      resourceId: assignment.id,
      actorId,
      organizationId,
      schoolId: student.schoolId,
    });

    return assignment;
  }

  async findAll(organizationId: string, filters: any) {
    return this.db.studentTransportAssignment.findMany({
      where: {
        route: { school: { organizationId }, schoolId: filters.schoolId },
        routeId: filters.routeId,
      },
      include: {
        student: { select: { firstName: true, lastName: true, admissionNumber: true } },
        route: true,
        stop: true,
      },
    });
  }

  async remove(organizationId: string, id: string, actorId: string) {
    const assignment = await this.db.studentTransportAssignment.findFirst({
      where: { id, route: { school: { organizationId } } },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');

    await this.db.studentTransportAssignment.delete({ where: { id } });

    await this.audit.log({
      action: 'transport.assignment.delete',
      resource: 'StudentTransportAssignment',
      resourceId: id,
      actorId,
      organizationId,
    });

    return { success: true };
  }
}
