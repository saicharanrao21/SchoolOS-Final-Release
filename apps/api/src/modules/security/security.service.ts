import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { VisitStatus, PassStatus, PickupStatus, IncidentStatus, IncidentSeverity } from '@prisma/client';
import { nanoid } from 'nanoid';

@Injectable()
export class SecurityService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getDashboard(organizationId: string, schoolId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [visitorsInside, expectedToday, activePickups, openIncidents] = await Promise.all([
      this.db.visitorVisit.count({ where: { status: VisitStatus.CHECKED_IN, visitor: { schoolId } } }),
      this.db.visitorVisit.count({ where: { expectedArrival: { gte: today }, visitor: { schoolId } } }),
      this.db.pickupRequest.count({ where: { status: { in: [PickupStatus.REQUESTED, PickupStatus.APPROVED, PickupStatus.READY] }, schoolId } }),
      this.db.incident.count({ where: { status: { not: IncidentStatus.CLOSED }, schoolId } }),
    ]);

    return { visitorsInside, expectedToday, activePickups, openIncidents };
  }

  // --- Visitor Management ---

  async registerVisitor(organizationId: string, data: any, actorId: string) {
    return this.db.$transaction(async (tx) => {
      let visitor = await tx.visitor.findFirst({
        where: { phone: data.phone, schoolId: data.schoolId },
      });

      if (!visitor) {
        visitor = await tx.visitor.create({
          data: {
            name: data.name,
            phone: data.phone,
            email: data.email,
            organization: data.organization,
            type: data.type,
            schoolId: data.schoolId,
          },
        });
      }

      const visit = await tx.visitorVisit.create({
        data: {
          visitorId: visitor.id,
          hostId: data.hostId,
          purpose: data.purpose,
          expectedArrival: new Date(data.expectedArrival),
          status: VisitStatus.PRE_REGISTERED,
        },
      });

      this.eventEmitter.emit('visitor.registered', { visitId: visit.id, hostId: data.hostId });
      return visit;
    });
  }

  async checkInVisitor(visitId: string, gateId: string, actorId: string) {
    const visit = await this.db.visitorVisit.findUnique({ where: { id: visitId } });
    if (!visit || visit.status !== VisitStatus.PRE_REGISTERED) {
      throw new BadRequestException('Invalid visit or already checked in');
    }

    const passNumber = `VP-${nanoid(8).toUpperCase()}`;
    const qrToken = nanoid(32);

    return this.db.$transaction(async (tx) => {
      const updated = await tx.visitorVisit.update({
        where: { id: visitId },
        data: {
          status: VisitStatus.CHECKED_IN,
          actualArrival: new Date(),
          entryGateId: gateId,
        },
      });

      await tx.visitorPass.create({
        data: {
          passNumber,
          visitId,
          qrToken,
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours validity
          status: PassStatus.ACTIVE,
        },
      });

      return updated;
    });
  }

  // --- Student Pickup ---

  async requestPickup(organizationId: string, data: any, actorId: string) {
    const request = await this.db.pickupRequest.create({
      data: {
        studentId: data.studentId,
        schoolId: data.schoolId,
        pickupPersonName: data.pickupPersonName,
        relationship: data.relationship,
        phone: data.phone,
        expectedTime: new Date(data.expectedTime),
        verificationCode: Math.floor(100000 + Math.random() * 900000).toString(),
        status: PickupStatus.REQUESTED,
      },
    });

    this.eventEmitter.emit('pickup.requested', { requestId: request.id, studentId: data.studentId });
    return request;
  }

  async verifyPickup(requestId: string, code: string) {
    const request = await this.db.pickupRequest.findUnique({ where: { id: requestId } });
    if (!request || request.verificationCode !== code) {
      throw new BadRequestException('Invalid verification code');
    }

    return this.db.pickupRequest.update({
      where: { id: requestId },
      data: { status: PickupStatus.VERIFIED, verifiedAt: new Date() },
    });
  }

  async releaseStudent(requestId: string, gateId: string, actorId: string) {
    const request = await this.db.pickupRequest.findUnique({ where: { id: requestId } });
    if (!request || request.status !== PickupStatus.VERIFIED) {
       throw new BadRequestException('Pickup must be verified before release');
    }

    const updated = await this.db.pickupRequest.update({
      where: { id: requestId },
      data: {
        status: PickupStatus.RELEASED,
        releasedAt: new Date(),
        gateId,
      },
    });

    this.eventEmitter.emit('student.released', { studentId: request.studentId, requestId });
    return updated;
  }

  // --- Incidents ---

  async reportIncident(organizationId: string, data: any, actorId: string) {
    const incident = await this.db.incident.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        severity: data.severity as IncidentSeverity,
        schoolId: data.schoolId,
        occurredAt: new Date(data.occurredAt),
        reportedById: actorId,
        status: IncidentStatus.REPORTED,
        location: data.location,
        participants: {
          create: data.participants?.map((p: any) => ({
            userId: p.userId,
            studentId: p.studentId,
            role: p.role,
          })),
        },
      },
    });

    if (incident.severity === IncidentSeverity.CRITICAL) {
      this.eventEmitter.emit('incident.critical', { incidentId: incident.id });
    }

    return incident;
  }

  // --- Phone Call Logs ---

  async logPhoneCall(organizationId: string, data: any, actorId: string) {
    const log = await this.db.phoneCallLog.create({
      data: {
        organizationId,
        schoolId: data.schoolId,
        callerName: data.callerName,
        phone: data.phone,
        callType: data.callType || 'INCOMING',
        purpose: data.purpose,
        notes: data.notes,
        callTime: data.callTime ? new Date(data.callTime) : new Date(),
        durationSeconds: data.durationSeconds,
        receivedById: actorId,
      },
    });

    await this.audit.log({
      action: 'frontoffice.call.log',
      resource: 'PhoneCallLog',
      resourceId: log.id,
      actorId,
      organizationId,
      schoolId: data.schoolId,
    });

    return log;
  }

  async getPhoneCalls(organizationId: string, schoolId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const where = { schoolId, school: { organizationId } };

    const [items, total] = await Promise.all([
      this.db.phoneCallLog.findMany({
        where,
        skip,
        take: limit,
        include: { receivedBy: true },
        orderBy: { callTime: 'desc' },
      }),
      this.db.phoneCallLog.count({ where }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  // --- Postal & Courier Records ---

  async recordPostal(organizationId: string, data: any, actorId: string) {
    const referenceNo = `PST-${Date.now().toString(36).toUpperCase()}`;
    const record = await this.db.postalRecord.create({
      data: {
        organizationId,
        schoolId: data.schoolId,
        referenceNo,
        type: data.type || 'DISPATCH',
        senderName: data.senderName,
        receiverName: data.receiverName,
        address: data.address,
        postalService: data.postalService,
        date: data.date ? new Date(data.date) : new Date(),
        receivedById: actorId,
      },
    });

    await this.audit.log({
      action: 'frontoffice.postal.record',
      resource: 'PostalRecord',
      resourceId: record.id,
      actorId,
      organizationId,
      schoolId: data.schoolId,
    });

    return record;
  }

  async getPostalRecords(organizationId: string, schoolId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const where = { schoolId, school: { organizationId } };

    const [items, total] = await Promise.all([
      this.db.postalRecord.findMany({
        where,
        skip,
        take: limit,
        include: { receivedBy: true },
        orderBy: { date: 'desc' },
      }),
      this.db.postalRecord.count({ where }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  // --- CCTV Cameras ---

  async registerCctvCamera(organizationId: string, data: any, actorId: string) {
    const camera = await this.db.cctvCamera.create({
      data: {
        organizationId,
        schoolId: data.schoolId,
        cameraName: data.cameraName,
        location: data.location,
        rtspUrl: data.rtspUrl,
        ipAddress: data.ipAddress,
        status: 'ONLINE',
      },
    });

    await this.audit.log({
      action: 'security.cctv.register',
      resource: 'CctvCamera',
      resourceId: camera.id,
      actorId,
      organizationId,
      schoolId: data.schoolId,
    });

    return camera;
  }

  async getCctvCameras(organizationId: string, schoolId: string) {
    return this.db.cctvCamera.findMany({
      where: { schoolId, school: { organizationId } },
      orderBy: { cameraName: 'asc' },
    });
  }
}

