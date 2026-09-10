import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ExamSchedulesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async create(organizationId: string, data: any, actorId: string) {
    const examSubject = await this.db.examSubject.findUnique({
      where: { id: data.examSubjectId },
      include: { examination: true },
    });

    if (!examSubject) throw new NotFoundException('Exam subject not found');

    // Conflict Check: Room & Invigilator
    const conflict = await this.db.examSchedule.findFirst({
      where: {
        date: new Date(data.date),
        OR: [
          { roomId: data.roomId, startTime: { lte: data.endTime }, endTime: { gte: data.startTime } },
          { invigilatorId: data.invigilatorId, startTime: { lte: data.endTime }, endTime: { gte: data.startTime } },
        ],
      },
    });

    if (conflict) {
      throw new BadRequestException('Room or Invigilator is already booked for this time');
    }

    const schedule = await this.db.examSchedule.create({
      data: {
        examinationId: examSubject.examinationId,
        subjectId: examSubject.subjectId,
        examSubjectId: data.examSubjectId,
        classId: data.classId,
        sectionId: data.sectionId,
        campusId: data.campusId,
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        roomId: data.roomId,
        invigilatorId: data.invigilatorId,
        instructions: data.instructions,
      },
    });

    await this.audit.log({
      action: 'exams.schedule.create',
      resource: 'ExamSchedule',
      resourceId: schedule.id,
      actorId,
      organizationId,
      schoolId: examSubject.examination.schoolId,
    });

    return schedule;
  }

  async findByExam(organizationId: string, examinationId: string) {
    return this.db.examSchedule.findMany({
      where: { examinationId, examination: { school: { organizationId } } },
      include: {
        subject: true,
        class: true,
        section: true,
        room: true,
        invigilator: true,
      },
      orderBy: { date: 'asc' },
    });
  }
}
