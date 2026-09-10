import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { Prisma } from '@prisma/client';
import { AuditService } from '../../../audit/audit.service';

@Injectable()
export class TermsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async create(organizationId: string, data: any, actorId?: string) {
    const ay = await this.db.academicYear.findFirst({
      where: { id: data.academicYearId, school: { organizationId } },
    });
    if (!ay) throw new NotFoundException('Academic Year not found');

    // Validation: overlap, sequence
    const term = await this.db.term.create({
      data: {
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        sequence: data.sequence,
        academicYear: { connect: { id: data.academicYearId } },
      },
    });

    await this.audit.log({
      action: 'term.create',
      resource: 'Term',
      resourceId: term.id,
      actorId,
      organizationId,
      schoolId: ay.schoolId,
    });

    return term;
  }

  async findAll(organizationId: string, academicYearId: string) {
    return this.db.term.findMany({
      where: {
        academicYearId,
        academicYear: { school: { organizationId } },
      },
      orderBy: { sequence: 'asc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const term = await this.db.term.findFirst({
      where: { id, academicYear: { school: { organizationId } } },
      include: { academicYear: true },
    });
    if (!term) throw new NotFoundException('Term not found');
    return term;
  }
}
