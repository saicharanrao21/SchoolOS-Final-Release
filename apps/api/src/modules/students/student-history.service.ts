import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class StudentHistoryService {
  constructor(private readonly db: DatabaseService) {}

  async getAcademicHistory(studentId: string) {
    return this.db.enrollment.findMany({
      where: { studentId },
      include: {
        academicYear: true,
        class: true,
        section: true,
        campus: true,
      },
      orderBy: { enrollmentDate: 'desc' },
    });
  }

  async getAuditHistory(studentId: string) {
    return this.db.auditEvent.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
