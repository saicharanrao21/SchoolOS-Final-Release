import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TeacherAssignmentsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async create(organizationId: string, data: any, actorId: string) {
    const school = await this.db.school.findFirst({
      where: { id: data.schoolId, organizationId },
    });
    if (!school) throw new NotFoundException('School not found');

    const assignment = await this.db.teacherSubjectAssignment.create({
      data: {
        employeeId: data.employeeId,
        subjectId: data.subjectId,
        classId: data.classId,
        sectionId: data.sectionId,
        academicYearId: data.academicYearId,
        termId: data.termId,
        isPrimary: data.isPrimary ?? true,
      },
    });

    await this.audit.log({
      action: 'academics.teacher_assignment.create',
      resource: 'TeacherSubjectAssignment',
      resourceId: assignment.id,
      actorId,
      organizationId,
      schoolId: data.schoolId,
    });

    return assignment;
  }

  async findAll(organizationId: string, filters: any) {
    return this.db.teacherSubjectAssignment.findMany({
      where: {
        employee: {
          school: { organizationId },
          schoolId: filters.schoolId,
        },
        academicYearId: filters.academicYearId,
        classId: filters.classId,
        sectionId: filters.sectionId,
        employeeId: filters.employeeId,
      },
      include: {
        employee: true,
        subject: true,
        class: true,
        section: true,
      },
    });
  }

  async remove(organizationId: string, id: string, actorId: string) {
    const assignment = await this.db.teacherSubjectAssignment.findFirst({
      where: { id, employee: { school: { organizationId } } },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');

    await this.db.teacherSubjectAssignment.delete({ where: { id } });

    await this.audit.log({
      action: 'academics.teacher_assignment.delete',
      resource: 'TeacherSubjectAssignment',
      resourceId: id,
      actorId,
      organizationId,
    });

    return { success: true };
  }
}
