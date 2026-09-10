import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class EnrollmentsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async enroll(organizationId: string, data: any, actorId?: string) {
    const student = await this.db.student.findFirst({
      where: { id: data.studentId, school: { organizationId } },
    });
    if (!student) throw new NotFoundException('Student not found');

    // Check for existing active enrollment in same AY
    const existing = await this.db.enrollment.findFirst({
      where: {
        studentId: data.studentId,
        academicYearId: data.academicYearId,
        status: 'ACTIVE'
      },
    });

    if (existing) {
      throw new BadRequestException('Student already has an active enrollment in this academic year');
    }

    return this.db.$transaction(async (tx) => {
      const enrollment = await tx.enrollment.create({
        data: {
          studentId: data.studentId,
          schoolId: student.schoolId,
          academicYearId: data.academicYearId,
          classId: data.classId,
          sectionId: data.sectionId,
          campusId: data.campusId,
          rollNumber: data.rollNumber,
          enrollmentDate: data.enrollmentDate ? new Date(data.enrollmentDate) : new Date(),
        },
      });

      await this.audit.log({
        action: 'student.enrollment.create',
        resource: 'Enrollment',
        resourceId: enrollment.id,
        actorId,
        organizationId,
        schoolId: student.schoolId,
        metadata: { classId: data.classId, sectionId: data.sectionId },
      });

      return enrollment;
    });
  }

  async promote(organizationId: string, enrollmentId: string, data: any, actorId?: string) {
    const oldEnrollment = await this.db.enrollment.findFirst({
      where: { id: enrollmentId, student: { school: { organizationId } } },
    });
    if (!oldEnrollment) throw new NotFoundException('Enrollment not found');

    return this.db.$transaction(async (tx) => {
      // 1. Close old enrollment
      await tx.enrollment.update({
        where: { id: enrollmentId },
        data: { status: 'COMPLETED' },
      });

      // 2. Create new enrollment
      const newEnrollment = await tx.enrollment.create({
        data: {
          studentId: oldEnrollment.studentId,
          schoolId: oldEnrollment.schoolId,
          academicYearId: data.toAcademicYearId,
          classId: data.toClassId,
          sectionId: data.toSectionId,
          campusId: data.toCampusId || oldEnrollment.campusId,
          rollNumber: data.rollNumber,
          enrollmentDate: new Date(),
        },
      });

      await this.audit.log({
        action: 'student.promotion',
        resource: 'Enrollment',
        resourceId: newEnrollment.id,
        actorId,
        organizationId,
        schoolId: oldEnrollment.schoolId,
        metadata: { fromAY: oldEnrollment.academicYearId, toAY: data.toAcademicYearId },
      });

      return newEnrollment;
    });
  }
}
