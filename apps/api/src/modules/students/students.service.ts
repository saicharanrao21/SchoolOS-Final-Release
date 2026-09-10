import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { Prisma, StudentStatus } from '@prisma/client';
import { AuditService } from '../../audit/audit.service';
import { NumberingService } from '../config/numbering.service';
import { AuthorizationService } from '../../auth/policy/authorization.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { TransferStudentDto } from './dto/transfer-student.dto';
import { CreateStudentNoteDto } from './dto/create-student-note.dto';
import { StudentFilterDto } from './dto/student-filter.dto';
import { normalizeName, normalizePhone, normalizeEmail } from './utils/identity-normalization.util';

export interface Student360Section {
  student: any;
  currentEnrollment: any;
  enrollmentHistory: any[];
  guardians: any[];
  documents: any[];
  notes: any[];
  attendanceSummary: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    percentage: number;
  };
  financeSummary: {
    totalBilled: number;
    totalPaid: number;
    outstandingBalance: number;
  };
}

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
    private readonly numbering: NumberingService,
    private readonly authz: AuthorizationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(organizationId: string, dto: CreateStudentDto, actorId: string) {
    // 1. Service-Level Scope Authorization
    const canAccess = await this.authz.canAccessScope(actorId, organizationId, dto.schoolId);
    if (!canAccess) {
      throw new ForbiddenException(`Service Authorization Blocked: Actor unauthorized for school '${dto.schoolId}'`);
    }

    // 2. Resolve School
    const school = await this.db.school.findFirst({
      where: { id: dto.schoolId, organizationId },
    });
    if (!school) throw new NotFoundException('Target school not found under organization');

    // 3. Graph Validation for Initial Enrollment
    if (dto.enrollment) {
      await this.validateEnrollmentGraph(
        organizationId,
        school.id,
        dto.enrollment.campusId,
        dto.enrollment.academicYearId,
        dto.enrollment.classId,
        dto.enrollment.sectionId,
      );
    }

    // 4. Validate House linkage
    if (dto.houseId) {
      const house = await this.db.house.findFirst({
        where: { id: dto.houseId, schoolId: school.id },
      });
      if (!house) throw new BadRequestException('House does not belong to target school');
    }

    return this.db.$transaction(async (tx) => {
      // Atomic Concurrency-Safe Admission Numbering
      const admissionNumber = await this.numbering.generateNextNumber(
        organizationId,
        'STUDENT_ADMISSION',
        school.id,
      );

      // Create Canonical Person Identity
      const person = await tx.person.create({
        data: {
          organizationId,
          firstName: dto.firstName,
          middleName: dto.middleName,
          lastName: dto.lastName,
          displayName: dto.displayName || `${dto.firstName} ${dto.lastName}`,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
          gender: dto.gender,
          nationality: dto.nationality,
          profilePhoto: dto.profilePhoto,
        },
      });

      // Create Student
      const student = await tx.student.create({
        data: {
          admissionNumber,
          firstName: dto.firstName,
          middleName: dto.middleName,
          lastName: dto.lastName,
          displayName: dto.displayName || `${dto.firstName} ${dto.lastName}`,
          dateOfBirth: new Date(dto.dateOfBirth),
          gender: dto.gender,
          admissionDate: dto.admissionDate ? new Date(dto.admissionDate) : new Date(),
          status: dto.status || StudentStatus.APPLICANT,
          nationality: dto.nationality,
          bloodGroup: dto.bloodGroup,
          religion: dto.religion,
          category: dto.category,
          school: { connect: { id: school.id } },
          person: { connect: { id: person.id } },
          house: dto.houseId ? { connect: { id: dto.houseId } } : undefined,
        },
      });

      // Create Initial Active Enrollment
      if (dto.enrollment) {
        await tx.enrollment.create({
          data: {
            studentId: student.id,
            schoolId: school.id,
            campusId: dto.enrollment.campusId,
            academicYearId: dto.enrollment.academicYearId,
            classId: dto.enrollment.classId,
            sectionId: dto.enrollment.sectionId,
            rollNumber: dto.enrollment.rollNumber,
            enrollmentDate: student.admissionDate,
            status: 'ACTIVE',
          },
        });
      }

      await this.audit.log({
        action: 'student.created',
        resource: 'Student',
        resourceId: student.id,
        actorId,
        organizationId,
        schoolId: school.id,
        metadata: { admissionNumber, personId: person.id },
      });

      this.eventEmitter.emit('student.created', {
        studentId: student.id,
        organizationId,
        schoolId: school.id,
      });

      return student;
    });
  }

  async transferStudent(organizationId: string, studentId: string, actorId: string, dto: TransferStudentDto) {
    const student = await this.findOne(organizationId, studentId);
    const targetSchoolId = dto.toSchoolId || student.schoolId;

    // Service-Level Authorization for Source and Target Schools
    const canAccessSource = await this.authz.canAccessScope(actorId, organizationId, student.schoolId);
    const canAccessTarget = await this.authz.canAccessScope(actorId, organizationId, targetSchoolId);

    if (!canAccessSource || !canAccessTarget) {
      throw new ForbiddenException('Service Authorization Blocked: Actor unauthorized for transfer target scope');
    }

    // Validate Target Hierarchy Consistency
    await this.validateEnrollmentGraph(
      organizationId,
      targetSchoolId,
      dto.toCampusId,
      dto.toAcademicYearId,
      dto.toClassId,
      dto.toSectionId,
    );

    return this.db.$transaction(async (tx) => {
      // Concurrency & Active Enrollment Guard: Set existing active enrollments to TRANSFERRED
      await tx.enrollment.updateMany({
        where: { studentId, status: 'ACTIVE' },
        data: { status: 'TRANSFERRED' },
      });

      // Create Transfer Audit History
      const transfer = await tx.studentTransfer.create({
        data: {
          studentId,
          fromSchoolId: student.schoolId,
          toSchoolId: targetSchoolId,
          fromCampusId: student.enrollments[0]?.campusId || student.schoolId,
          toCampusId: dto.toCampusId,
          reason: dto.reason,
          authorizedById: actorId,
          transferDate: new Date(),
        },
      });

      // Create New Active Enrollment
      const newEnrollment = await tx.enrollment.create({
        data: {
          studentId,
          schoolId: targetSchoolId,
          campusId: dto.toCampusId,
          academicYearId: dto.toAcademicYearId,
          classId: dto.toClassId,
          sectionId: dto.toSectionId,
          enrollmentDate: new Date(),
          status: 'ACTIVE',
        },
      });

      if (targetSchoolId !== student.schoolId) {
        await tx.student.update({
          where: { id: studentId },
          data: { schoolId: targetSchoolId },
        });
      }

      await this.audit.log({
        action: 'student.transferred',
        resource: 'Student',
        resourceId: studentId,
        actorId,
        organizationId,
        schoolId: targetSchoolId,
        metadata: { fromSchoolId: student.schoolId, toSchoolId: targetSchoolId, reason: dto.reason },
      });

      this.eventEmitter.emit('student.transferred', {
        studentId,
        fromSchoolId: student.schoolId,
        toSchoolId: targetSchoolId,
      });

      return { transfer, newEnrollment };
    });
  }

  async getStudent360(organizationId: string, studentId: string, requestingUser: any): Promise<Student360Section> {
    const student = await this.findOne(organizationId, studentId);

    // Parent IDOR Defense: Ensure guardian-child relationship is active
    if (requestingUser.roles?.includes('PARENT')) {
      const guardianRel = await this.db.guardianStudent.findFirst({
        where: {
          studentId,
          guardian: { userId: requestingUser.id },
        },
      });
      if (!guardianRel) {
        throw new ForbiddenException('Parent IDOR Defense: You are not authorized to view unlinked student profile');
      }
    }

    // Student Self-Access Defense
    if (requestingUser.roles?.includes('STUDENT') && student.userId !== requestingUser.id) {
      throw new ForbiddenException('Student IDOR Defense: You can only view your own student profile');
    }

    const currentEnrollment = student.enrollments.find((e) => e.status === 'ACTIVE') || student.enrollments[0];

    // Database Aggregations for Attendance (NO full array memory loads)
    const attendanceStats = await this.db.studentAttendanceRecord.groupBy({
      by: ['status'],
      where: { studentId },
      _count: { status: true },
    });

    let presentDays = 0;
    let absentDays = 0;
    let totalDays = 0;

    for (const stat of attendanceStats) {
      const count = stat._count.status;
      totalDays += count;
      if (stat.status === 'PRESENT') presentDays += count;
      if (stat.status === 'ABSENT') absentDays += count;
    }
    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    // Database Aggregations for Finance
    const feeAccount = await this.db.studentFeeAccount.findUnique({
      where: { studentId },
    });
    const totalBilled = feeAccount ? Number(feeAccount.totalBilled) : 0;
    const totalPaid = feeAccount ? Number(feeAccount.totalPaid) : 0;
    const outstandingBalance = feeAccount ? Number(feeAccount.balance) : 0;

    // Privacy-Aware Notes Filter
    const notes = await this.db.studentNote.findMany({
      where: {
        studentId,
        ...(requestingUser.roles?.includes('PARENT') || requestingUser.roles?.includes('STUDENT') ? { isPrivate: false } : {}),
      },
      include: { author: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return {
      student,
      currentEnrollment,
      enrollmentHistory: student.enrollments,
      guardians: student.guardians,
      documents: student.documents,
      notes,
      attendanceSummary: { totalDays, presentDays, absentDays, percentage },
      financeSummary: { totalBilled, totalPaid, outstandingBalance },
    };
  }

  async detectDuplicates(organizationId: string, schoolId?: string) {
    const students = await this.db.student.findMany({
      where: { school: { organizationId }, ...(schoolId ? { schoolId } : {}) },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        admissionNumber: true,
        schoolId: true,
      },
      take: 200,
      orderBy: { createdAt: 'desc' },
    });

    const duplicates: any[] = [];
    for (let i = 0; i < students.length; i++) {
      for (let j = i + 1; j < students.length; j++) {
        const s1 = students[i];
        const s2 = students[j];

        const norm1 = `${normalizeName(s1.firstName)}_${normalizeName(s1.lastName)}`;
        const norm2 = `${normalizeName(s2.firstName)}_${normalizeName(s2.lastName)}`;

        const nameMatch = norm1 === norm2;
        const dobMatch = s1.dateOfBirth?.toISOString().slice(0, 10) === s2.dateOfBirth?.toISOString().slice(0, 10);

        if (nameMatch && dobMatch) {
          duplicates.push({ student1: s1, student2: s2, matchReason: 'Normalized Name and Date of Birth Match' });
        }
      }
    }

    return duplicates;
  }

  async update(organizationId: string, id: string, dto: UpdateStudentDto, actorId?: string) {
    const student = await this.findOne(organizationId, id);

    // Service-Level Authorization
    const canAccess = await this.authz.canAccessScope(actorId || '', organizationId, student.schoolId);
    if (actorId && !canAccess) {
      throw new ForbiddenException('Service Authorization Blocked: Actor unauthorized for student school scope');
    }

    return this.db.$transaction(async (tx) => {
      const updated = await tx.student.update({
        where: { id },
        data: {
          firstName: dto.firstName,
          middleName: dto.middleName,
          lastName: dto.lastName,
          displayName: dto.displayName,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
          gender: dto.gender,
          status: dto.status,
          nationality: dto.nationality,
          bloodGroup: dto.bloodGroup,
          religion: dto.religion,
          category: dto.category,
          houseId: dto.houseId,
        },
      });

      // Synchronize Canonical Person Entity
      if (student.personId) {
        await tx.person.update({
          where: { id: student.personId },
          data: {
            firstName: dto.firstName,
            middleName: dto.middleName,
            lastName: dto.lastName,
            displayName: dto.displayName,
            dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
            gender: dto.gender,
            nationality: dto.nationality,
          },
        });
      }

      await this.audit.log({
        action: 'student.updated',
        resource: 'Student',
        resourceId: id,
        actorId,
        organizationId,
        schoolId: student.schoolId,
      });

      return updated;
    });
  }

  async addStudentNote(organizationId: string, studentId: string, authorId: string, dto: CreateStudentNoteDto) {
    const student = await this.findOne(organizationId, studentId);

    const canAccess = await this.authz.canAccessScope(authorId, organizationId, student.schoolId);
    if (!canAccess) {
      throw new ForbiddenException('Service Authorization Blocked: Actor unauthorized to write student notes');
    }

    return this.db.studentNote.create({
      data: {
        studentId,
        authorId,
        category: dto.category || 'GENERAL',
        content: dto.content,
        isPrivate: dto.isPrivate ?? false,
      },
    });
  }

  async findAll(organizationId: string, filters: StudentFilterDto) {
    const {
      page = 1,
      limit = 10,
      search,
      classId,
      sectionId,
      status,
      schoolId,
      academicYearId,
    } = filters;

    const skip = (page - 1) * limit;

    const where: Prisma.StudentWhereInput = {
      school: { organizationId },
      isActive: true,
    };

    if (schoolId) where.schoolId = schoolId;
    if (status) where.status = status as StudentStatus;

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
            include: { class: true, section: true, campus: true },
            take: 1,
          },
        },
        skip,
        take: parseInt(String(limit)),
        orderBy: { createdAt: 'desc' },
      }),
      this.db.student.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page: parseInt(String(page)),
        limit: parseInt(String(limit)),
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
        person: true,
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

    if (!student) throw new NotFoundException('Student not found under organization');
    return student;
  }

  async updateStatus(organizationId: string, id: string, status: StudentStatus, actorId?: string, notes?: string) {
    const student = await this.findOne(organizationId, id);

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

    this.eventEmitter.emit('student.status.changed', { studentId: id, previousStatus: student.status, newStatus: status });

    return updated;
  }

  private async validateEnrollmentGraph(
    organizationId: string,
    schoolId: string,
    campusId: string,
    academicYearId: string,
    classId: string,
    sectionId: string,
  ) {
    // 1. Campus belongs to School
    const campus = await this.db.campus.findFirst({
      where: { id: campusId, schoolId },
    });
    if (!campus) throw new BadRequestException(`Campus '${campusId}' does not belong to school '${schoolId}'`);

    // 2. AcademicYear belongs to School
    const academicYear = await this.db.academicYear.findFirst({
      where: { id: academicYearId, schoolId },
    });
    if (!academicYear) throw new BadRequestException(`Academic Year '${academicYearId}' does not belong to school '${schoolId}'`);
    if (academicYear.status === 'CLOSED' || academicYear.status === 'ARCHIVED') {
      throw new BadRequestException(`Academic Year '${academicYear.name}' is CLOSED/ARCHIVED and cannot accept new enrollments`);
    }

    // 3. Class belongs to School
    const targetClass = await this.db.class.findFirst({
      where: { id: classId, schoolId },
    });
    if (!targetClass) throw new BadRequestException(`Class '${classId}' does not belong to school '${schoolId}'`);

    // 4. Section belongs to Class
    const section = await this.db.section.findFirst({
      where: { id: sectionId, classId },
    });
    if (!section) throw new BadRequestException(`Section '${sectionId}' does not belong to class '${classId}'`);
  }
}
