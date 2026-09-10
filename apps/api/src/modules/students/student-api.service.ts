import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class StudentApiService {
  constructor(private readonly db: DatabaseService) {}

  async getStudentProfile(userId: string) {
    const student = await this.db.student.findUnique({
      where: { userId },
      include: {
        school: true,
        enrollments: {
          where: { status: 'ACTIVE' },
          include: { class: true, section: true, academicYear: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!student) throw new NotFoundException('Student profile not found');
    return student;
  }

  async getDashboard(userId: string) {
    const student = await this.getStudentProfile(userId);
    const enrollment = student.enrollments[0];
    if (!enrollment) return { student, dashboard: null };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's Timetable
    const dayOfWeek = new Date().getDay() || 7;
    const timetableEntries = await this.db.timetableEntry.findMany({
      where: {
        timetableVersion: {
          timetable: {
            classId: enrollment.classId,
            sectionId: enrollment.sectionId,
            status: 'PUBLISHED'
          },
          status: 'PUBLISHED'
        },
        period: { dayOfWeek }
      },
      include: { period: true, subject: true, employee: true, room: true },
      orderBy: { period: { startTime: 'asc' } }
    });

    // Homework Due
    const homework = await this.db.assignment.findMany({
      where: {
        classId: enrollment.classId,
        sectionId: enrollment.sectionId,
        dueDate: { gte: new Date() },
        submissions: { none: { studentId: student.id } }
      },
      include: { subject: true },
      take: 5,
      orderBy: { dueDate: 'asc' }
    });

    // Upcoming Exams
    const exams = await this.db.examSchedule.findMany({
      where: {
        classId: enrollment.classId,
        date: { gte: new Date() }
      },
      include: { examination: true, subject: true },
      take: 3,
      orderBy: { date: 'asc' }
    });

    // Attendance Summary
    const attendanceStats = await this.db.studentAttendanceRecord.groupBy({
      by: ['status'],
      where: { studentId: student.id, session: { academicYearId: enrollment.academicYearId } },
      _count: true
    });

    return {
      student,
      timetableToday: timetableEntries,
      pendingHomework: homework,
      upcomingExams: exams,
      attendanceStats
    };
  }

  async getTimetable(userId: string) {
    const student = await this.getStudentProfile(userId);
    const enrollment = student.enrollments[0];
    if (!enrollment) throw new NotFoundException('No active enrollment found');

    return this.db.timetableEntry.findMany({
      where: {
        timetableVersion: {
          timetable: {
            classId: enrollment.classId,
            sectionId: enrollment.sectionId,
            status: 'PUBLISHED'
          },
          status: 'PUBLISHED'
        }
      },
      include: { period: true, subject: true, employee: true, room: true },
      orderBy: [
        { period: { dayOfWeek: 'asc' } },
        { period: { startTime: 'asc' } }
      ]
    });
  }

  async getHomework(userId: string) {
    const student = await this.getStudentProfile(userId);
    const enrollment = student.enrollments[0];
    if (!enrollment) throw new NotFoundException('No active enrollment found');

    return this.db.assignment.findMany({
      where: {
        classId: enrollment.classId,
        sectionId: enrollment.sectionId,
      },
      include: {
        subject: true,
        submissions: { where: { studentId: student.id } }
      },
      orderBy: { assignedDate: 'desc' }
    });
  }

  async getResults(userId: string) {
    const student = await this.getStudentProfile(userId);
    return this.db.result.findMany({
      where: { studentId: student.id, status: 'PUBLISHED' },
      include: {
        examination: true,
        subjects: { include: { subject: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAttendance(userId: string, academicYearId?: string) {
    const student = await this.getStudentProfile(userId);
    const ayId = academicYearId || student.enrollments[0]?.academicYearId;

    return this.db.studentAttendanceRecord.findMany({
      where: { studentId: student.id, session: { academicYearId: ayId } },
      include: { session: true },
      orderBy: { session: { date: 'desc' } }
    });
  }
}
