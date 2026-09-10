import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TeacherService {
  constructor(private readonly db: DatabaseService) {}

  async getEmployeeByUserId(userId: string) {
    const employee = await this.db.employee.findUnique({
      where: { userId },
      include: {
        school: true,
        department: true,
        teacherSubjectAssignments: {
          where: { status: 'ACTIVE' },
          include: { class: true, section: true, subject: true, academicYear: true },
        },
      },
    });

    if (!employee) throw new NotFoundException('Teacher profile not found');
    return employee;
  }

  async verifyAssignment(userId: string, classId: string, sectionId?: string, subjectId?: string) {
    const assignment = await this.db.teacherSubjectAssignment.findFirst({
      where: {
        employee: { userId },
        classId,
        sectionId,
        subjectId,
        status: 'ACTIVE',
      },
    });

    if (!assignment) {
      throw new ForbiddenException('You are not assigned to this class/subject');
    }
    return assignment;
  }

  async getDashboard(userId: string) {
    const employee = await this.getEmployeeByUserId(userId);
    const today = new Date();
    const dayOfWeek = today.getDay() || 7; // Convert 0 (Sunday) to 7 if needed, or adjust to your system

    // Today's Timetable
    const timetableEntries = await this.db.timetableEntry.findMany({
      where: {
        employeeId: employee.id,
        timetableVersion: { status: 'PUBLISHED' },
        period: { dayOfWeek },
      },
      include: {
        period: true,
        subject: true,
        timetableVersion: {
          include: {
            timetable: {
              include: { class: true, section: true }
            }
          }
        },
        room: true,
      },
      orderBy: { period: { startTime: 'asc' } },
    });

    // Pending Homework Reviews
    const homeworkSummary = await this.db.assignment.findMany({
      where: {
        employeeId: employee.id,
        status: 'PUBLISHED',
      },
      include: {
        _count: {
          select: {
            submissions: { where: { status: 'SUBMITTED' } }
          }
        }
      }
    });

    const pendingReviewsCount = homeworkSummary.reduce((sum, h) => sum + h._count.submissions, 0);

    // Upcoming Exams
    const exams = await this.db.examSchedule.findMany({
      where: {
        invigilatorId: employee.id,
        date: { gte: today },
      },
      include: {
        examination: true,
        subject: true,
        class: true,
        section: true,
      },
      take: 5,
      orderBy: { date: 'asc' },
    });

    return {
      profile: {
        firstName: employee.firstName,
        lastName: employee.lastName,
        designation: employee.designation,
        department: employee.department.name,
      },
      timetableToday: timetableEntries,
      pendingReviewsCount,
      upcomingExams: exams,
    };
  }

  async getClasses(userId: string) {
    const employee = await this.getEmployeeByUserId(userId);
    return employee.teacherSubjectAssignments;
  }

  async getClassStudents(userId: string, classId: string, sectionId: string) {
    await this.verifyAssignment(userId, classId, sectionId);

    return this.db.student.findMany({
      where: {
        enrollments: {
          some: { classId, sectionId, status: 'ACTIVE' }
        }
      },
      include: {
        attendanceRecords: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { session: true }
        }
      },
      orderBy: { firstName: 'asc' }
    });
  }

  async getTimetable(userId: string) {
    const employee = await this.getEmployeeByUserId(userId);

    return this.db.timetableEntry.findMany({
      where: {
        employeeId: employee.id,
        timetableVersion: { status: 'PUBLISHED' },
      },
      include: {
        period: true,
        subject: true,
        room: true,
        timetableVersion: {
          include: {
            timetable: {
              include: { class: true, section: true }
            }
          }
        }
      },
      orderBy: [
        { period: { dayOfWeek: 'asc' } },
        { period: { startTime: 'asc' } }
      ]
    });
  }
}
