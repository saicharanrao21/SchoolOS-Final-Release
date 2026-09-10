import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { Prisma, AttendanceSessionStatus } from '@prisma/client';

@Injectable()
export class AttendanceSessionsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async create(organizationId: string, data: any, actorId: string) {
    const school = await this.db.school.findFirst({
      where: { id: data.schoolId, organizationId },
    });
    if (!school) throw new NotFoundException('School not found');

    // Check if session already exists for this date, class, section, type
    const existing = await this.db.attendanceSession.findFirst({
      where: {
        date: new Date(data.date),
        type: data.type,
        classId: data.classId,
        sectionId: data.sectionId,
        schoolId: data.schoolId,
      },
    });

    if (existing) {
      throw new BadRequestException('Attendance session already exists for this criteria');
    }

    const session = await this.db.attendanceSession.create({
      data: {
        date: new Date(data.date),
        type: data.type,
        classId: data.classId,
        sectionId: data.sectionId,
        schoolId: data.schoolId,
        academicYearId: data.academicYearId,
        createdById: actorId,
      },
    });

    await this.audit.log({
      action: 'attendance.session.create',
      resource: 'AttendanceSession',
      resourceId: session.id,
      actorId,
      organizationId,
      schoolId: data.schoolId,
    });

    return session;
  }

  async findOne(organizationId: string, id: string) {
    const session = await this.db.attendanceSession.findFirst({
      where: { id, section: { class: { school: { organizationId } } } },
      include: {
        section: { include: { class: true } },
        studentRecords: { include: { student: true } },
      },
    });
    if (!session) throw new NotFoundException('Attendance session not found');
    return session;
  }

  async updateStatus(organizationId: string, id: string, status: AttendanceSessionStatus, actorId: string) {
    const session = await this.findOne(organizationId, id);

    // Validate transition
    if (session.status === AttendanceSessionStatus.LOCKED) {
      throw new BadRequestException('Cannot change status of a locked session');
    }

    const updated = await this.db.attendanceSession.update({
      where: { id },
      data: { status },
    });

    await this.audit.log({
      action: `attendance.session.status.${status.toLowerCase()}`,
      resource: 'AttendanceSession',
      resourceId: id,
      actorId,
      organizationId,
      schoolId: session.schoolId,
    });

    return updated;
  }
}
