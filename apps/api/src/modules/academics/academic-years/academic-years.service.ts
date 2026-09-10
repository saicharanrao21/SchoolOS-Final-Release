import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { Prisma, AcademicYearStatus } from '@prisma/client';
import { AuditService } from '../../../audit/audit.service';

@Injectable()
export class AcademicYearsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async create(organizationId: string, data: any, actorId?: string) {
    const school = await this.db.school.findFirst({
      where: { id: data.schoolId, organizationId },
    });
    if (!school) throw new NotFoundException('School not found');

    if (new Date(data.startDate) >= new Date(data.endDate)) {
      throw new BadRequestException('Start date must be before end date');
    }

    const ay = await this.db.academicYear.create({
      data: {
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        school: { connect: { id: data.schoolId } },
      },
    });

    await this.audit.log({
      action: 'academic_year.create',
      resource: 'AcademicYear',
      resourceId: ay.id,
      actorId,
      organizationId,
      schoolId: data.schoolId,
    });

    return ay;
  }

  async findAll(organizationId: string, schoolId?: string) {
    return this.db.academicYear.findMany({
      where: {
        schoolId,
        school: { organizationId },
      },
      include: { school: true },
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const ay = await this.db.academicYear.findFirst({
      where: { id, school: { organizationId } },
      include: { school: true, terms: true },
    });
    if (!ay) throw new NotFoundException('Academic Year not found');
    return ay;
  }

  async setCurrent(organizationId: string, id: string, actorId?: string) {
    const ay = await this.findOne(organizationId, id);

    if (ay.status === AcademicYearStatus.CLOSED || ay.status === AcademicYearStatus.ARCHIVED) {
      throw new BadRequestException('Cannot set a closed or archived year as current');
    }

    return this.db.$transaction(async (tx) => {
      // Unset previous current
      await tx.academicYear.updateMany({
        where: { schoolId: ay.schoolId, isCurrent: true },
        data: { isCurrent: false },
      });

      // Set new current
      const updated = await tx.academicYear.update({
        where: { id },
        data: { isCurrent: true, status: AcademicYearStatus.ACTIVE },
      });

      await this.audit.log({
        action: 'academic_year.set_current',
        resource: 'AcademicYear',
        resourceId: id,
        actorId,
        organizationId,
        schoolId: ay.schoolId,
      });

      return updated;
    });
  }

  async updateStatus(organizationId: string, id: string, status: AcademicYearStatus, actorId?: string) {
    const ay = await this.findOne(organizationId, id);

    // Basic transition validation
    if (ay.status === AcademicYearStatus.CLOSED && status === AcademicYearStatus.ACTIVE) {
      throw new BadRequestException('Cannot reopen a closed academic year');
    }

    const updated = await this.db.academicYear.update({
      where: { id },
      data: { status },
    });

    await this.audit.log({
      action: `academic_year.status_change.${status.toLowerCase()}`,
      resource: 'AcademicYear',
      resourceId: id,
      actorId,
      organizationId,
      schoolId: ay.schoolId,
    });

    return updated;
  }
}
