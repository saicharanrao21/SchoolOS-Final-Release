import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private readonly db: DatabaseService) {}

  async getExecutiveKpis(organizationId: string, schoolId: string) {
    const [students, admissions, employees, collections] = await Promise.all([
      this.db.student.count({ where: { schoolId, isActive: true } }),
      this.db.admissionApplication.count({ where: { schoolId } }),
      this.db.employee.count({ where: { schoolId, isActive: true } }),
      this.db.payment.aggregate({
        where: { student: { schoolId }, status: 'SUCCESS' },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalStudents: students,
      pendingAdmissions: admissions,
      totalStaff: employees,
      totalCollection: Number(collections._sum.amount || 0),
    };
  }

  async getStudentAnalytics(organizationId: string, schoolId: string) {
    const distribution = await this.db.enrollment.groupBy({
      by: ['classId'],
      where: { schoolId, status: 'ACTIVE' },
      _count: { studentId: true },
    });

    const classes = await this.db.class.findMany({
      where: { id: { in: distribution.map(d => d.classId) } },
      select: { id: true, name: true },
    });

    return distribution.map(d => ({
      className: classes.find(c => c.id === d.classId)?.name || 'Unknown',
      count: d._count.studentId,
    }));
  }

  async getFinanceAnalytics(organizationId: string, schoolId: string) {
    const monthlyCollection = await this.db.$queryRaw`
      SELECT
        DATE_TRUNC('month', "paymentDate") as month,
        SUM(amount) as total
      FROM "Payment"
      WHERE "status" = 'SUCCESS'
      GROUP BY month
      ORDER BY month DESC
      LIMIT 6
    `;

    return monthlyCollection;
  }

  async getAttendanceAnalytics(organizationId: string, schoolId: string) {
    const stats = await this.db.studentAttendanceRecord.groupBy({
      by: ['status'],
      where: { session: { schoolId } },
      _count: true,
    });

    return stats.map(s => ({
      status: s.status,
      count: s._count,
    }));
  }

  async getAcademicAnalytics(organizationId: string, schoolId: string) {
    const homeworkCompletion = await this.db.assignment.findMany({
      where: { schoolId },
      include: {
        _count: { select: { submissions: true } },
        class: { select: { name: true } },
      },
      take: 10,
    });

    return homeworkCompletion.map(h => ({
      title: h.title,
      className: h.class.name,
      submissions: h._count.submissions,
    }));
  }
}
