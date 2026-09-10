import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { Prisma, StudentStatus } from '@prisma/client';
import { AuditService } from '../../audit/audit.service';
import { NumberingService } from '../config/numbering.service';

export interface Student360Result {
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
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
    private readonly numbering: NumberingService,
  ) {}

  async create(organizationId: string, data: any, actorId?: string) {
    const school = await this.db.school.findFirst({
      where: { id: data.schoolId, organizationId },
    });
    if (!school) throw new NotFoundException('School not found under organization');

    return this.db.$transaction(async (tx) => {
      // 1. Generate Atomic Concurrency-Safe Admission Number
      const admissionNumber = await this.numbering.generateNextNumber(
        organizationId,
        'STUDENT_ADMISSION',
        school.id,
      );

      // 2. Create Canonical Person Entity
      const person = await tx.person.create({
        data: {
          organizationId,
          firstName: data.firstName,
          middleName: data.middleName,
          lastName: data.lastName,
          displayName: data.displayName || `${data.firstName} ${data.lastName}`,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          gender: data.gender,
          nationality: data.nationality,
          primaryLanguage: data.primaryLanguage,
          profilePhoto: data.profilePhoto,
        },
      });

      // 3. Create Student Entity
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
          person: { connect: { id: person.id } },
          house: data.houseId ? { connect: { id: data.houseId } } : undefined,
          metadata: data.metadata || {},
        },
      });

      // 4. Initial Enrollment if provided
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
            status: 'ACTIVE',
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
        metadata: { admissionNumber, personId: person.id },
      });

      return student;
    });
  }

  async getStudent360(organizationId: string, studentId: string, requestingUser: any): Promise<Student360Result> {
    const student = await this.findOne(organizationId, studentId);

    // Parent/Guardian Authorization Defense
    if (requestingUser.roles?.includes('PARENT')) {
      const isLinkedGuardian = student.guardians.some((g) => g.guardian.userId === requestingUser.id);
      if (!isLinkedGuardian) {
        throw new ForbiddenException('Parent IDOR Defense: You are not authorized to view unlinked student profiles');
      }
    }

    // Student Self-Access Defense
    if (requestingUser.roles?.includes('STUDENT') && student.userId !== requestingUser.id) {
      throw new ForbiddenException('Student IDOR Defense: You can only view your own student profile');
    }

    const currentEnrollment = student.enrollments.find((e) => e.status === 'ACTIVE') || student.enrollments[0];

    // Attendance Summary
    const attendanceRecords = await this.db.studentAttendanceRecord.findMany({
      where: { studentId },
    });
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter((a) => a.status === 'PRESENT').length;
    const absentDays = attendanceRecords.filter((a) => a.status === 'ABSENT').length;
    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    // Finance Summary
    const feeAccount = await this.db.studentFeeAccount.findUnique({
      where: { studentId },
    });
    const totalBilled = feeAccount ? Number(feeAccount.totalBilled) : 0;
    const totalPaid = feeAccount ? Number(feeAccount.totalPaid) : 0;
    const outstandingBalance = feeAccount ? Number(feeAccount.balance) : 0;

    // Filter Private Notes unless authorized staff
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

  async transferStudent(organizationId: string, studentId: string, actorId: string, data: {
    toSchoolId?: string;
    toCampusId: string;
    toAcademicYearId: string;
    toClassId: string;
    toSectionId: string;
    reason: string;
  }) {
    const student = await this.findOne(organizationId, studentId);
    const targetSchoolId = data.toSchoolId || student.schoolId;

    return this.db.$transaction(async (tx) => {
      // 1. Mark current active enrollments as TRANSFERRED
      await tx.enrollment.updateMany({
        where: { studentId, status: 'ACTIVE' },
        data: { status: 'TRANSFERRED' },
      });

      // 2. Create StudentTransfer History Record
      const transfer = await tx.studentTransfer.create({
        data: {
          studentId,
          fromSchoolId: student.schoolId,
          toSchoolId: targetSchoolId,
          fromCampusId: student.enrollments[0]?.campusId || student.schoolId,
          toCampusId: data.toCampusId,
          reason: data.reason,
          authorizedById: actorId,
          transferDate: new Date(),
        },
      });

      // 3. Create New Active Enrollment Record preserving past history
      const newEnrollment = await tx.enrollment.create({
        data: {
          studentId,
          schoolId: targetSchoolId,
          campusId: data.toCampusId,
          academicYearId: data.toAcademicYearId,
          classId: data.toClassId,
          sectionId: data.toSectionId,
          enrollmentDate: new Date(),
          status: 'ACTIVE',
        },
      });

      // 4. Update student schoolId if cross-school transfer
      if (targetSchoolId !== student.schoolId) {
        await tx.student.update({
          where: { id: studentId },
          data: { schoolId: targetSchoolId },
        });
      }

      await this.audit.log({
        action: 'student.transfer',
        resource: 'Student',
        resourceId: studentId,
        actorId,
        organizationId,
        schoolId: targetSchoolId,
        metadata: { fromSchoolId: student.schoolId, toSchoolId: targetSchoolId, reason: data.reason },
      });

      return { transfer, newEnrollment };
    });
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
    });

    const duplicates: any[] = [];
    for (let i = 0; i < students.length; i++) {
      for (let j = i + 1; j < students.length; j++) {
        const s1 = students[i];
        const s2 = students[j];

        const nameMatch = s1.firstName.toLowerCase() === s2.firstName.toLowerCase() && s1.lastName.toLowerCase() === s2.lastName.toLowerCase();
        const dobMatch = s1.dateOfBirth?.toISOString().slice(0, 10) === s2.dateOfBirth?.toISOString().slice(0, 10);

        if (nameMatch && dobMatch) {
          duplicates.push({ student1: s1, student2: s2, matchReason: 'Identical Name and Date of Birth' });
        }
      }
    }

    return duplicates;
  }

  async addStudentNote(organizationId: string, studentId: string, authorId: string, data: { category: string; content: string; isPrivate?: boolean }) {
    await this.findOne(organizationId, studentId);

    return this.db.studentNote.create({
      data: {
        studentId,
        authorId,
        category: data.category || 'GENERAL',
        content: data.content,
        isPrivate: data.isPrivate ?? false,
      },
    });
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
      academicYearId,
    } = filters;

    const skip = (page - 1) * limit;

    const where: Prisma.StudentWhereInput = {
      school: { organizationId },
      isActive: true,
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
            include: { class: true, section: true, campus: true },
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
}
