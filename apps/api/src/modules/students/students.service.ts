import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { Prisma, StudentStatus } from '@prisma/client';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class StudentsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async create(organizationId: string, data: any, actorId?: string) {
    const school = await this.db.school.findFirst({
      where: { id: data.schoolId, organizationId },
    });
    if (!school) throw new NotFoundException('School not found');

    return this.db.$transaction(async (tx) => {
      // 1. Generate Admission Number
      const admissionNumber = await this.generateAdmissionNumber(tx, school.id, school.code || 'SCH');

      // 2. Create Student
      const student = await tx.student.create({
        data: {
          admissionNumber,
          firstName: data.firstName,
          middleName: data.middleName,
          lastName: data.lastName,
          displayName: data.displayName || `${data.firstName} ${data.lastName}`,
          dateOfBirth: new Date(data.dateOfBirth),
          gender: data.gender,
          admissionDate: data.admissionDate ? new Date(data.admissionDate) : new Date(),
          status: data.status || StudentStatus.APPLICANT,
          nationality: data.nationality,
          bloodGroup: data.bloodGroup,
          religion: data.religion,
          category: data.category,
          school: { connect: { id: data.schoolId } },
          house: data.houseId ? { connect: { id: data.houseId } } : undefined,
          metadata: data.metadata || {},
        },
      });

      // 3. Initial Enrollment if provided
      if (data.enrollment) {
        await tx.enrollment.create({
          data: {
            student: { connect: { id: student.id } },
            schoolId: school.id,
            academicYear: { connect: { id: data.enrollment.academicYearId } },
            class: { connect: { id: data.enrollment.classId } },
            section: { connect: { id: data.enrollment.sectionId } },
            campus: { connect: { id: data.enrollment.campusId } },
            rollNumber: data.enrollment.rollNumber,
            enrollmentDate: student.admissionDate,
          },
        });
      }

      await this.audit.log({
        action: 'student.create',
        resource: 'Student',
        resourceId: student.id,
        actorId,
        organizationId,
        schoolId: school.id,
        metadata: { admissionNumber },
      });

      return student;
    });
  }

  private async generateAdmissionNumber(tx: Prisma.TransactionClient, schoolId: string, schoolCode: string): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    const count = await tx.student.count({ where: { schoolId } });
    const sequence = (count + 1).toString().padStart(4, '0');
    return `${schoolCode}${year}${sequence}`;
  }

  async findAll(organizationId: string, filters: any) {
    const {
      page = 1,
      limit = 10,
      search,
      classId,
      sectionId,
      status,
      schoolId,
      academicYearId
    } = filters;

    const skip = (page - 1) * limit;

    const where: Prisma.StudentWhereInput = {
      school: { organizationId },
      isActive: true, // We should add isActive to Student if not there, or use status
    };

    if (schoolId) where.schoolId = schoolId;
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { admissionNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (classId || sectionId || academicYearId) {
      where.enrollments = {
        some: {
          classId: classId || undefined,
          sectionId: sectionId || undefined,
          academicYearId: academicYearId || undefined,
          status: 'ACTIVE',
        },
      };
    }

    const [items, total] = await Promise.all([
      this.db.student.findMany({
        where,
        include: {
          enrollments: {
            where: { status: 'ACTIVE' },
            include: { class: true, section: true },
            take: 1,
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.db.student.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(organizationId: string, id: string) {
    const student = await this.db.student.findFirst({
      where: { id, school: { organizationId } },
      include: {
        school: true,
        house: true,
        enrollments: {
          include: { academicYear: true, class: true, section: true, campus: true },
          orderBy: { enrollmentDate: 'desc' },
        },
        guardians: {
          include: { guardian: true },
        },
        documents: true,
        transfers: true,
        withdrawals: true,
      },
    });

    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async update(organizationId: string, id: string, data: Prisma.StudentUpdateInput, actorId?: string) {
    const student = await this.findOne(organizationId, id);
    const updated = await this.db.student.update({
      where: { id },
      data,
    });

    await this.audit.log({
      action: 'student.update',
      resource: 'Student',
      resourceId: id,
      actorId,
      organizationId,
      schoolId: student.schoolId,
    });

    return updated;
  }

  async updateStatus(organizationId: string, id: string, status: StudentStatus, actorId?: string, notes?: string) {
    const student = await this.findOne(organizationId, id);

    // Validate transition
    this.validateStatusTransition(student.status, status);

    const updated = await this.db.student.update({
      where: { id },
      data: { status },
    });

    await this.audit.log({
      action: `student.status.${status.toLowerCase()}`,
      resource: 'Student',
      resourceId: id,
      actorId,
      organizationId,
      schoolId: student.schoolId,
      metadata: { previousStatus: student.status, notes },
    });

    return updated;
  }

  private validateStatusTransition(current: StudentStatus, target: StudentStatus) {
    if (current === target) return;

    if (current === StudentStatus.ALUMNI || current === StudentStatus.WITHDRAWN || current === StudentStatus.TRANSFERRED) {
      if (target !== StudentStatus.ACTIVE) {
        throw new BadRequestException(`Cannot transition from ${current} to ${target}`);
      }
    }
    // More complex rules can be added here
  }
}
