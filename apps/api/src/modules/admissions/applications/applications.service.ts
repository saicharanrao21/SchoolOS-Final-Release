import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { Prisma, AdmissionStatus, StudentStatus } from '@prisma/client';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async create(organizationId: string, data: any, actorId?: string) {
    const school = await this.db.school.findFirst({
      where: { id: data.schoolId, organizationId },
    });
    if (!school) throw new NotFoundException('School not found');

    const applicationNumber = await this.generateApplicationNumber(school.id, school.code || 'SCH');

    const application = await this.db.admissionApplication.create({
      data: {
        applicationNumber,
        enquiryId: data.enquiryId,
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        address: data.address,
        schoolId: school.id,
        academicYearId: data.academicYearId,
        classId: data.classId,
        campusId: data.campusId,
        status: AdmissionStatus.APPLICATION,
        previousSchool: data.previousSchool,
        previousGrade: data.previousGrade,
        assignedToId: data.assignedToId,
      },
    });

    await this.audit.log({
      action: 'admission.application.create',
      resource: 'AdmissionApplication',
      resourceId: application.id,
      actorId,
      organizationId,
      schoolId: school.id,
      metadata: { applicationNumber },
    });

    return application;
  }

  private async generateApplicationNumber(schoolId: string, schoolCode: string): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    const count = await this.db.admissionApplication.count({ where: { schoolId } });
    return `APP-${schoolCode}${year}${(count + 1).toString().padStart(4, '0')}`;
  }

  async findAll(organizationId: string, filters: any) {
    const { page = 1, limit = 10, search, status, schoolId } = filters;
    const skip = (parseInt(page.toString()) - 1) * parseInt(limit.toString());

    const where: Prisma.AdmissionApplicationWhereInput = {
      school: { organizationId },
    };

    if (schoolId) where.schoolId = schoolId;
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { contactPhone: { contains: search } },
        { applicationNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.db.admissionApplication.findMany({
        where,
        skip,
        take: parseInt(limit.toString()),
        orderBy: { createdAt: 'desc' },
        include: {
          class: true,
          academicYear: true,
          assignedTo: { select: { id: true, firstName: true, lastName: true } }
        },
      }),
      this.db.admissionApplication.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page: parseInt(page.toString()),
        limit: parseInt(limit.toString()),
        totalPages: Math.ceil(total / parseInt(limit.toString())),
      }
    };
  }

  async findOne(organizationId: string, id: string) {
    const application = await this.db.admissionApplication.findFirst({
      where: { id, school: { organizationId } },
      include: {
        school: true,
        academicYear: true,
        class: true,
        campus: true,
        documents: true,
        assessments: true,
        interviews: true,
        decision: true,
        offer: true,
        assignedTo: true,
        enquiry: true
      },
    });
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }

  async updateStatus(organizationId: string, id: string, status: AdmissionStatus, actorId: string, reason?: string) {
    const app = await this.findOne(organizationId, id);

    const updated = await this.db.admissionApplication.update({
      where: { id },
      data: { status },
    });

    await this.audit.log({
      action: `admission.application.status.${status.toLowerCase()}`,
      resource: 'AdmissionApplication',
      resourceId: id,
      actorId,
      organizationId,
      schoolId: app.schoolId,
      metadata: { previousStatus: app.status, reason },
    });

    return updated;
  }

  async convertToStudent(organizationId: string, id: string, sectionId: string, actorId: string) {
    const app = await this.db.admissionApplication.findFirst({
      where: { id, school: { organizationId } },
      include: { school: true },
    });

    if (!app) throw new NotFoundException('Application not found');
    if (app.studentId) throw new BadRequestException('Application already converted to student');

    // Check if section exists in the intended class
    const section = await this.db.section.findFirst({
      where: { id: sectionId, classId: app.classId },
    });
    if (!section) throw new BadRequestException('Invalid section for the selected class');

    return this.db.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Admission Number Generation (matching Phase 3 logic)
      const admissionNumber = await this.generateAdmissionNumberInternal(tx, app.schoolId, app.school.code || 'SCH');

      // 2. Create Student
      const student = await tx.student.create({
        data: {
          admissionNumber,
          firstName: app.firstName,
          middleName: app.middleName,
          lastName: app.lastName,
          displayName: `${app.firstName} ${app.lastName}`,
          dateOfBirth: app.dateOfBirth,
          gender: app.gender,
          admissionDate: new Date(),
          status: StudentStatus.ACTIVE,
          school: { connect: { id: app.schoolId } },
        },
      });

      // 3. Create Enrollment
      await tx.enrollment.create({
        data: {
          studentId: student.id,
          schoolId: app.schoolId,
          academicYearId: app.academicYearId,
          classId: app.classId,
          sectionId: sectionId,
          campusId: app.campusId,
          enrollmentDate: new Date(),
          status: 'ACTIVE',
        },
      });

      // 4. Update Application
      await tx.admissionApplication.update({
        where: { id },
        data: {
          status: AdmissionStatus.ENROLLED,
          studentId: student.id
        },
      });

      await this.audit.log({
        action: 'admission.convert_to_student',
        resource: 'AdmissionApplication',
        resourceId: id,
        actorId,
        organizationId,
        schoolId: app.schoolId,
        metadata: { studentId: student.id, admissionNumber },
      });

      return student;
    });
  }

  private async generateAdmissionNumberInternal(tx: any, schoolId: string, schoolCode: string): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    const count = await tx.student.count({ where: { schoolId } });
    return `${schoolCode}${year}${(count + 1).toString().padStart(4, '0')}`;
  }
}
