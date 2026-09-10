import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';
import { Prisma, PtmStatus } from '@prisma/client';

@Injectable()
export class PtmService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  private async assertSchool(organizationId: string, schoolId: string) {
    const school = await this.db.school.findFirst({ where: { id: schoolId, organizationId, isActive: true }, select: { id: true } });
    if (!school) throw new NotFoundException('School not found');
  }

  async createPtmEvent(organizationId: string, data: any, actorId: string) {
    await this.assertSchool(organizationId, data.schoolId);
    if (new Date(data.endTime) <= new Date(data.startTime)) throw new BadRequestException('PTM end time must be after start time');
    const event = await this.db.ptmEvent.create({
      data: {
        name: data.name,
        academicYearId: data.academicYearId,
        schoolId: data.schoolId,
        date: new Date(data.date),
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        mode: data.mode,
      },
    });

    await this.audit.log({
      action: 'ptm.event.create',
      resource: 'PtmEvent',
      resourceId: event.id,
      actorId,
      organizationId,
    });

    return event;
  }

  async createSlots(organizationId: string, data: any, actorId: string) {
    const event = await this.db.ptmEvent.findFirst({ where: { id: data.ptmEventId, school: { organizationId } } });
    if (!event) throw new NotFoundException('PTM event not found');
    const teacherIds = [...new Set((data.slots || []).map((s: any) => s.teacherId))] as string[];
    const teacherCount = await this.db.employee.count({ where: { id: { in: teacherIds }, schoolId: event.schoolId, isActive: true } });
    if (teacherCount !== teacherIds.length) throw new BadRequestException('One or more teachers do not belong to the PTM school');
    const slots = data.slots.map((s: any) => ({
      ptmEventId: data.ptmEventId,
      teacherId: s.teacherId,
      startTime: new Date(s.startTime),
      endTime: new Date(s.endTime),
      room: s.room,
      status: PtmStatus.SCHEDULED,
    }));

    for (const slot of slots) {
      if (slot.endTime <= slot.startTime) throw new BadRequestException('PTM slot end time must be after start time');
      const overlap = await this.db.ptmSlot.findFirst({ where: { teacherId: slot.teacherId, startTime: { lt: slot.endTime }, endTime: { gt: slot.startTime }, ptmEvent: { schoolId: event.schoolId } } });
      if (overlap) throw new BadRequestException(`Teacher ${slot.teacherId} has an overlapping PTM slot`);
    }
    return this.db.$transaction(async (tx) => {
      const created = await tx.ptmSlot.createMany({ data: slots });
      await this.audit.log({ action: 'ptm.slots.create', resource: 'PtmSlot', resourceId: data.ptmEventId, actorId, organizationId });
      return created;
    });
  }

  async bookSlot(organizationId: string, userId: string, slotId: string, data: any) {
    const guardian = await this.db.guardian.findUnique({ where: { userId } });
    if (!guardian) throw new NotFoundException('Guardian profile not found');

    const slot = await this.db.ptmSlot.findFirst({ where: { id: slotId, ptmEvent: { school: { organizationId } } }, include: { ptmEvent: true } });
    if (!slot || slot.status !== PtmStatus.SCHEDULED) {
      throw new BadRequestException('Slot is not available');
    }
    const student = await this.db.student.findFirst({ where: { id: data.studentId, schoolId: slot.ptmEvent.schoolId } });
    if (!student) throw new BadRequestException('Student does not belong to the PTM school');
    const linked = await this.db.guardianStudent.findUnique({ where: { studentId_guardianId: { studentId: data.studentId, guardianId: guardian.id } } });
    if (!linked) throw new BadRequestException('Guardian is not linked to this student');
    const booked = await this.db.ptmSlot.findFirst({ where: { guardianId: guardian.id, ptmEventId: slot.ptmEventId, status: PtmStatus.CONFIRMED } });
    if (booked) throw new BadRequestException('Guardian already has a confirmed PTM booking for this event');
    return this.db.ptmSlot.update({
      where: { id: slotId },
      data: {
        studentId: data.studentId,
        guardianId: guardian.id,
        status: PtmStatus.CONFIRMED,
      },
    });
  }

  async getDashboard(organizationId: string, schoolId: string) {
    const [totalEvents, bookedSlots, totalSlots] = await Promise.all([
      this.db.ptmEvent.count({ where: { schoolId } }),
      this.db.ptmSlot.count({ where: { ptmEvent: { schoolId }, status: PtmStatus.CONFIRMED } }),
      this.db.ptmSlot.count({ where: { ptmEvent: { schoolId } } }),
    ]);

    return { totalEvents, bookedSlots, totalSlots };
  }

  async findAvailableSlots(organizationId: string, eventId: string, teacherId?: string) {
    const event = await this.db.ptmEvent.findFirst({ where: { id: eventId, school: { organizationId } }, select: { id: true } });
    if (!event) throw new NotFoundException('PTM event not found');
    return this.db.ptmSlot.findMany({
      where: {
        ptmEventId: eventId,
        ...(teacherId ? { teacherId } : {}),
        status: PtmStatus.SCHEDULED
      },
      include: { teacher: { select: { firstName: true, lastName: true } } },
      orderBy: { startTime: 'asc' },
    });
  }

  async getTeacherMeetings(organizationId: string, userId: string) {
    return this.db.ptmSlot.findMany({
      where: { teacher: { userId, school: { organizationId } }, status: PtmStatus.CONFIRMED },
      include: {
        student: true,
        guardian: true,
        ptmEvent: true
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async getGuardianMeetings(organizationId: string, userId: string) {
    return this.db.ptmSlot.findMany({
      where: { guardian: { userId }, status: PtmStatus.CONFIRMED, ptmEvent: { school: { organizationId } } },
      include: {
        student: true,
        teacher: { select: { firstName: true, lastName: true } },
        ptmEvent: true
      },
      orderBy: { startTime: 'asc' },
    });
  }
}
