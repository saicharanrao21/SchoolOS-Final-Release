import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class ParentService {
  constructor(private readonly db: DatabaseService) {}

  async getGuardianByUserId(userId: string) {
    const guardian = await this.db.guardian.findUnique({
      where: { userId },
      include: {
        students: {
          include: {
            student: {
              include: {
                school: true,
                enrollments: {
                  where: { status: 'ACTIVE' },
                  include: { class: true, section: true, academicYear: true },
                  orderBy: { createdAt: 'desc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!guardian) throw new NotFoundException('Guardian profile not found');
    return guardian;
  }

  async verifyRelationship(userId: string, studentId: string) {
    const relationship = await this.db.guardianStudent.findFirst({
      where: {
        studentId,
        guardian: { userId },
      },
    });

    if (!relationship) {
      throw new ForbiddenException('You are not authorized to access this student information');
    }
    return relationship;
  }

  async getChildren(userId: string) {
    const guardian = await this.getGuardianByUserId(userId);
    return guardian.students.map((gs) => ({
      ...gs.student,
      relationship: gs.relationship,
      isPrimary: gs.isPrimary,
      currentEnrollment: gs.student.enrollments[0] || null,
    }));
  }

  async getChildDashboard(userId: string, studentId: string) {
    await this.verifyRelationship(userId, studentId);

    const student = await this.db.student.findUnique({
      where: { id: studentId },
      include: {
        enrollments: { where: { status: 'ACTIVE' }, include: { class: true, section: true }, take: 1 },
        feeAccount: true,
        transportAssignment: { include: { route: true, stop: true } },
      },
    });

    if (!student) throw new NotFoundException('Student not found');

    // Today's Attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const attendance = await this.db.studentAttendanceRecord.findFirst({
      where: {
        studentId,
        session: { date: today },
      },
      include: { session: true },
    });

    // Upcoming Exams
    const upcomingExams = await this.db.examSchedule.findMany({
      where: {
        date: { gte: new Date() },
        classId: student.enrollments[0]?.classId,
      },
      include: { subject: true },
      take: 2,
      orderBy: { date: 'asc' },
    });

    // Homework Summary
    const pendingHomework = await this.db.assignment.count({
      where: {
        classId: student.enrollments[0]?.classId,
        sectionId: student.enrollments[0]?.sectionId,
        dueDate: { gte: new Date() },
        submissions: { none: { studentId } },
      },
    });

    return {
      student,
      attendanceToday: attendance || null,
      feeSummary: student.feeAccount || null,
      upcomingExams,
      pendingHomeworkCount: pendingHomework,
      transport: student.transportAssignment || null,
    };
  }

  async getChildAttendance(userId: string, studentId: string, academicYearId: string) {
    await this.verifyRelationship(userId, studentId);

    const records = await this.db.studentAttendanceRecord.findMany({
      where: {
        studentId,
        session: { academicYearId },
      },
      include: { session: true },
      orderBy: { session: { date: 'desc' } },
    });

    const stats = records.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {} as any);

    return { records, stats };
  }

  async getChildAcademics(userId: string, studentId: string) {
    await this.verifyRelationship(userId, studentId);

    const enrollment = await this.db.enrollment.findFirst({
      where: { studentId, status: 'ACTIVE' },
    });

    if (!enrollment) throw new NotFoundException('Active enrollment not found');

    const timetable = await this.db.timetable.findFirst({
      where: {
        classId: enrollment.classId,
        sectionId: enrollment.sectionId,
        status: 'PUBLISHED'
      },
      include: {
        versions: {
          where: { status: 'PUBLISHED' },
          include: {
            entries: {
              include: { period: true, subject: true, employee: true, room: true }
            }
          }
        }
      }
    });

    const assignments = await this.db.assignment.findMany({
      where: {
        classId: enrollment.classId,
        sectionId: enrollment.sectionId,
      },
      include: {
        subject: true,
        submissions: { where: { studentId } }
      },
      orderBy: { dueDate: 'desc' },
      take: 10
    });

    return {
      timetable: timetable?.versions[0] || null,
      assignments
    };
  }

  async getChildExams(userId: string, studentId: string) {
    await this.verifyRelationship(userId, studentId);

    const enrollment = await this.db.enrollment.findFirst({
      where: { studentId, status: 'ACTIVE' },
    });

    if (!enrollment) throw new NotFoundException('Active enrollment not found');

    const exams = await this.db.examination.findMany({
      where: {
        schoolId: enrollment.schoolId,
        academicYearId: enrollment.academicYearId,
        status: { in: ['PUBLISHED', 'ONGOING', 'SCHEDULED'] }
      },
      include: {
        schedules: {
          where: { classId: enrollment.classId },
          include: { subject: true, room: true }
        },
        results: {
          where: { studentId },
          include: { subjects: { include: { subject: true } } }
        }
      },
      orderBy: { startDate: 'desc' }
    });

    return exams;
  }

  async getChildFinance(userId: string, studentId: string) {
    await this.verifyRelationship(userId, studentId);

    const account = await this.db.studentFeeAccount.findUnique({
      where: { studentId },
    });

    const invoices = await this.db.feeDemand.findMany({
      where: { studentId },
      orderBy: { dueDate: 'desc' },
      include: { payments: true }
    });

    const payments = await this.db.payment.findMany({
      where: { studentId },
      include: { receipt: true },
      orderBy: { paymentDate: 'desc' }
    });

    return { account, invoices, payments };
  }

  async getChildTransport(userId: string, studentId: string) {
    await this.verifyRelationship(userId, studentId);

    const assignment = await this.db.studentTransportAssignment.findUnique({
      where: { studentId },
      include: {
        route: { include: { stops: { orderBy: { sequence: 'asc' } } } },
        stop: true,
      },
    });

    if (!assignment) return null;

    const activeTrip = await this.db.transportTrip.findFirst({
      where: {
        routeId: assignment.routeId,
        status: { in: ['STARTED', 'IN_PROGRESS', 'ARRIVED'] },
      },
      include: {
        vehicle: true,
        driver: { select: { firstName: true, lastName: true, phone: true } },
        locations: { orderBy: { timestamp: 'desc' }, take: 1 }
      }
    });

    return { assignment, activeTrip };
  }
}
