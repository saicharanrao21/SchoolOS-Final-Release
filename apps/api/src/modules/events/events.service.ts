import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';
import { Prisma, EventStatus, RegistrationStatus } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  private async assertSchool(organizationId: string, schoolId: string) {
    const school = await this.db.school.findFirst({ where: { id: schoolId, organizationId, isActive: true }, select: { id: true } });
    if (!school) throw new NotFoundException('School not found');
    return school;
  }

  async createEvent(organizationId: string, data: any, actorId: string) {
    await this.assertSchool(organizationId, data.schoolId);
    if (new Date(data.endDate) <= new Date(data.startDate)) throw new BadRequestException('Event end must be after start');
    const event = await this.db.schoolEvent.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        schoolId: data.schoolId,
        campusId: data.campusId,
        venueId: data.venueId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        registrationStart: data.registrationStart ? new Date(data.registrationStart) : null,
        registrationEnd: data.registrationEnd ? new Date(data.registrationEnd) : null,
        capacity: data.capacity,
        status: EventStatus.DRAFT,
        visibility: data.visibility || 'PUBLIC',
      },
    });

    await this.audit.log({
      action: 'event.create',
      resource: 'SchoolEvent',
      resourceId: event.id,
      actorId,
      organizationId,
    });

    return event;
  }

  async register(organizationId: string, userId: string, eventId: string) {
    return this.db.$transaction(async (tx) => {
      const event = await tx.schoolEvent.findFirst({
        where: { id: eventId, school: { organizationId } },
        include: { _count: { select: { participants: true } } },
      });
      if (!event || event.status !== EventStatus.PUBLISHED) throw new BadRequestException('Event is not open for registration');
      const now = new Date();
      if (event.registrationStart && now < event.registrationStart) throw new BadRequestException('Registration has not started');
      if (event.registrationEnd && now > event.registrationEnd) throw new BadRequestException('Registration has closed');
      const existing = await tx.eventParticipant.findUnique({ where: { eventId_userId: { eventId, userId } } });
      if (existing && existing.status !== RegistrationStatus.CANCELLED) throw new BadRequestException('Already registered for this event');
      const activeCount = await tx.eventParticipant.count({ where: { eventId, status: { in: [RegistrationStatus.PENDING, RegistrationStatus.CONFIRMED] } } });
      if (event.capacity && activeCount >= event.capacity) throw new BadRequestException('Event reached maximum capacity');
      return tx.eventParticipant.upsert({
        where: { eventId_userId: { eventId, userId } },
        update: { status: RegistrationStatus.CONFIRMED, registrationDate: now },
        create: { eventId, userId, status: RegistrationStatus.CONFIRMED },
      });
    });
  }

  async changeStatus(organizationId: string, eventId: string, status: EventStatus, actorId: string) {
    const event = await this.db.schoolEvent.findFirst({ where: { id: eventId, school: { organizationId } } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.status === EventStatus.COMPLETED || event.status === EventStatus.CANCELLED) throw new BadRequestException('Event is already closed');
    if (status === EventStatus.PUBLISHED && event.endDate <= new Date()) throw new BadRequestException('Past events cannot be published');
    const updated = await this.db.schoolEvent.update({ where: { id: eventId }, data: { status } });
    await this.audit.log({ action: `event.${status.toLowerCase()}`, resource: 'SchoolEvent', resourceId: eventId, actorId, organizationId });
    return updated;
  }

  async setAttendance(organizationId: string, eventId: string, participantId: string, attendance: boolean, actorId: string) {
    const participant = await this.db.eventParticipant.findFirst({ where: { id: participantId, event: { id: eventId, school: { organizationId } } } });
    if (!participant) throw new NotFoundException('Participant not found');
    if (participant.status === RegistrationStatus.CANCELLED) throw new BadRequestException('Cancelled registration cannot be marked present');
    const updated = await this.db.eventParticipant.update({ where: { id: participantId }, data: { attendance } });
    await this.audit.log({ action: attendance ? 'event.attendance.marked_present' : 'event.attendance.marked_absent', resource: 'EventParticipant', resourceId: participantId, actorId, organizationId });
    return updated;
  }

  async cancelRegistration(organizationId: string, userId: string, eventId: string) {
    const participant = await this.db.eventParticipant.findFirst({ where: { eventId, userId, event: { school: { organizationId } } } });
    if (!participant || participant.status === RegistrationStatus.CANCELLED) throw new NotFoundException('Registration not found');
    return this.db.eventParticipant.update({ where: { id: participant.id }, data: { status: RegistrationStatus.CANCELLED } });
  }

  async getDashboard(organizationId: string, schoolId: string) {
    const today = new Date();
    await this.assertSchool(organizationId, schoolId);
    const [upcoming, totalParticipants, published, checkedIn] = await Promise.all([
      this.db.schoolEvent.count({ where: { schoolId, startDate: { gte: today } } }),
      this.db.eventParticipant.count({ where: { event: { schoolId } } }),
      this.db.schoolEvent.count({ where: { schoolId, status: EventStatus.PUBLISHED } }),
      this.db.eventParticipant.count({ where: { event: { schoolId }, attendance: true } }),
    ]);

    return { upcomingEvents: upcoming, totalParticipants, publishedEvents: published, checkedInParticipants: checkedIn };
  }

  async findAllEvents(organizationId: string, schoolId: string) {
    await this.assertSchool(organizationId, schoolId);
    return this.db.schoolEvent.findMany({
      where: { schoolId, school: { organizationId } },
      include: { venue: true, _count: { select: { participants: true } } },
      orderBy: { startDate: 'asc' },
    });
  }

  async getMyEvents(organizationId: string, userId: string) {
    return this.db.eventParticipant.findMany({
      where: { userId, event: { school: { organizationId } } },
      include: { event: { include: { venue: true } } },
    });
  }
}
