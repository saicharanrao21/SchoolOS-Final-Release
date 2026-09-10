import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';
import { AuditSeverity } from '@prisma/client';

@Injectable()
export class AcademicStructureService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  // --- Academic Years & Terms ---

  async createAcademicYear(organizationId: string, schoolId: string, actorId: string, data: any) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException('Academic year end date must be after start date');
    }

    const school = await this.db.school.findFirst({
      where: { id: schoolId, organizationId },
    });
    if (!school) throw new NotFoundException('School not found under organization');

    const year = await this.db.academicYear.create({
      data: {
        schoolId,
        name: data.name,
        startDate,
        endDate,
        status: data.status || 'DRAFT',
        isCurrent: data.isCurrent || false,
      },
    });

    await this.audit.log({
      action: 'academic_year.created',
      resource: 'AcademicYear',
      resourceId: year.id,
      actorId,
      organizationId,
      schoolId,
      severity: AuditSeverity.MEDIUM,
    });

    return year;
  }

  async getAcademicYears(organizationId: string, schoolId: string) {
    return this.db.academicYear.findMany({
      where: { schoolId, school: { organizationId } },
      include: { terms: { orderBy: { sequence: 'asc' } } },
      orderBy: { startDate: 'desc' },
    });
  }

  // --- Classes & Sections ---

  async createClass(organizationId: string, schoolId: string, data: any) {
    const existing = await this.db.class.findFirst({
      where: { schoolId, name: data.name, academicYearId: data.academicYearId || null },
    });
    if (existing) {
      throw new BadRequestException(`Class '${data.name}' already exists for this academic context`);
    }

    return this.db.class.create({
      data: {
        schoolId,
        academicYearId: data.academicYearId,
        name: data.name,
        code: data.code,
        sequence: data.sequence || 1,
        isActive: true,
      },
    });
  }

  async createSection(organizationId: string, classId: string, data: any) {
    const targetClass = await this.db.class.findFirst({
      where: { id: classId, school: { organizationId } },
    });
    if (!targetClass) throw new NotFoundException('Class not found');

    const existing = await this.db.section.findFirst({
      where: { classId, name: data.name },
    });
    if (existing) {
      throw new BadRequestException(`Section '${data.name}' already exists in class '${targetClass.name}'`);
    }

    return this.db.section.create({
      data: {
        classId,
        name: data.name,
        code: data.code,
        capacity: data.capacity || 40,
        roomId: data.roomId,
        classTeacherId: data.classTeacherId,
        isActive: true,
      },
    });
  }

  async getClassesAndSections(organizationId: string, schoolId: string) {
    return this.db.class.findMany({
      where: { schoolId, school: { organizationId } },
      include: {
        sections: true,
        subjects: { include: { subject: true } },
      },
      orderBy: { sequence: 'asc' },
    });
  }

  // --- Subjects ---

  async createSubject(organizationId: string, schoolId: string, data: any) {
    return this.db.subject.create({
      data: {
        schoolId,
        name: data.name,
        code: data.code,
        type: data.type || 'Theory',
        category: data.category || 'Core',
        isActive: true,
      },
    });
  }

  async getSubjects(organizationId: string, schoolId: string) {
    return this.db.subject.findMany({
      where: { schoolId, school: { organizationId } },
      orderBy: { name: 'asc' },
    });
  }

  // --- Departments & Houses ---

  async getDepartments(organizationId: string, schoolId: string) {
    return this.db.department.findMany({
      where: { schoolId, school: { organizationId } },
      orderBy: { name: 'asc' },
    });
  }

  async createDepartment(organizationId: string, schoolId: string, data: any) {
    return this.db.department.create({
      data: {
        schoolId,
        name: data.name,
        code: data.code,
        isActive: true,
      },
    });
  }

  async getHouses(organizationId: string, schoolId: string) {
    return this.db.house.findMany({
      where: { schoolId, school: { organizationId } },
      orderBy: { name: 'asc' },
    });
  }

  async createHouse(organizationId: string, schoolId: string, data: any) {
    return this.db.house.create({
      data: {
        schoolId,
        name: data.name,
        code: data.code,
        color: data.color,
        isActive: true,
      },
    });
  }
}
