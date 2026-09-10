import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DmsService } from '../../dms/dms.service';
import { ResultStatus } from '@prisma/client';

@Injectable()
export class ReportCardsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
    private readonly eventEmitter: EventEmitter2,
    private readonly dms: DmsService,
  ) {}

  async generateReportCards(organizationId: string, examinationId: string, classId: string, sectionId: string, actorId: string) {
    const exam = await this.db.examination.findUnique({
      where: { id: examinationId },
      include: { school: true, academicYear: true },
    });

    if (!exam) throw new NotFoundException('Examination not found');

    const publishedResults = await this.db.result.findMany({
      where: {
        examinationId,
        classId,
        sectionId,
        status: ResultStatus.PUBLISHED,
      },
      include: {
        student: {
          include: {
            user: true,
            enrollments: { where: { status: 'ACTIVE' }, include: { class: true, section: true } },
          },
        },
        subjects: { include: { subject: true } },
        snapshots: { orderBy: { version: 'desc' }, take: 1 },
      },
    });

    if (publishedResults.length === 0) {
      throw new BadRequestException('No published results found for this class and examination');
    }

    let template = await this.db.reportCardTemplate.findFirst({
      where: { schoolId: exam.schoolId, isActive: true },
    });

    if (!template) {
      template = await this.db.reportCardTemplate.create({
        data: {
          name: 'Default Report Card Template',
          schoolId: exam.schoolId,
          config: { layout: 'STANDARD' },
          isActive: true,
        },
      });
    }

    const reportCards = [];

    for (const res of publishedResults) {
      const student = res.student;

      // Compile Report Card Data Payload
      const reportCardData = {
        studentName: `${student.firstName} ${student.lastName}`,
        admissionNumber: student.admissionNumber,
        className: student.enrollments[0]?.class.name,
        sectionName: student.enrollments[0]?.section.name,
        academicYear: exam.academicYear.name,
        examinationName: exam.name,
        totalMarks: res.totalMarks,
        maxMarks: res.maxMarks,
        percentage: res.percentage,
        grade: res.grade,
        overallResult: res.overallResult,
        rank: res.rank,
        subjects: res.subjects.map(s => ({
          subjectName: s.subject.name,
          marksObtained: s.marksObtained,
          maxMarks: s.maxMarks,
          percentage: s.percentage,
          grade: s.grade,
          isPassing: s.isPassing,
        })),
      };

      // Generate HTML printable report card
      const htmlContent = this.renderReportCardHtml(exam.school.name, reportCardData);
      const fileName = `ReportCard_${student.admissionNumber}_${exam.name.replace(/\s+/g, '_')}.html`;

      // Save ReportCard record
      const reportCard = await this.db.reportCard.upsert({
        where: { id: `${student.id}_${examinationId}` },
        update: {
          data: reportCardData as any,
          status: 'GENERATED',
          publishedAt: new Date(),
        },
        create: {
          id: `${student.id}_${examinationId}`,
          studentId: student.id,
          academicYearId: exam.academicYearId,
          classId,
          sectionId,
          templateId: template.id,
          data: reportCardData as any,
          fileUrl: `/uploads/report-cards/${fileName}`,
          status: 'GENERATED',
          publishedAt: new Date(),
        },
      });

      // Integrate with DMS (Phase 20 Document System)
      if (student.userId) {
        await this.dms.uploadDocument(
          organizationId,
          {
            title: `Report Card - ${exam.name}`,
            description: `Official Academic Report Card for ${exam.name}`,
            category: 'ACADEMIC',
            type: 'REPORT_CARD',
            ownerId: student.id,
            ownerType: 'Student',
            originalFilename: fileName,
            mimeType: 'text/html',
            fileSize: Buffer.byteLength(htmlContent, 'utf8'),
            storagePath: `/uploads/report-cards/${fileName}`,
            schoolId: exam.schoolId,
            issuingAuthority: exam.school.name,
          },
          actorId,
        );
      }

      reportCards.push(reportCard);

      // Emit domain event for Notification Orchestrator (Phase 24)
      this.eventEmitter.emit('reportcard.generated', {
        studentId: student.id,
        examinationId,
        schoolId: exam.schoolId,
        organizationId,
      });
    }

    await this.audit.log({
      action: 'exams.reportcard.generate',
      resource: 'Examination',
      resourceId: examinationId,
      actorId,
      organizationId,
      schoolId: exam.schoolId,
      metadata: { count: reportCards.length },
    });

    return { success: true, generatedCount: reportCards.length };
  }

  private renderReportCardHtml(schoolName: string, data: any): string {
    const rows = data.subjects.map((s: any) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${s.subjectName}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${s.marksObtained} / ${s.maxMarks}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${s.percentage.toFixed(1)}%</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${s.grade || '-'}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${s.isPassing ? 'PASS' : 'FAIL'}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Report Card - ${data.studentName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
          .info { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #2563eb; color: white; padding: 10px; border: 1px solid #2563eb; }
          .summary { background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${schoolName}</h2>
          <h3>OFFICIAL ACADEMIC REPORT CARD</h3>
          <p>${data.examinationName} (${data.academicYear})</p>
        </div>
        <div class="info">
          <div>
            <p><strong>Student Name:</strong> ${data.studentName}</p>
            <p><strong>Admission No:</strong> ${data.admissionNumber}</p>
          </div>
          <div>
            <p><strong>Class & Section:</strong> ${data.className} - ${data.sectionName}</p>
            <p><strong>Roll No:</strong> ${data.rollNumber || 'N/A'}</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Marks Obtained</th>
              <th>Percentage</th>
              <th>Grade</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <div class="summary">
          <p><strong>Total Marks:</strong> ${data.totalMarks} / ${data.maxMarks}</p>
          <p><strong>Overall Percentage:</strong> ${data.percentage.toFixed(2)}%</p>
          <p><strong>Overall Result:</strong> <span style="color: ${data.overallResult === 'PASS' ? 'green' : 'red'}; font-weight: bold;">${data.overallResult}</span></p>
        </div>
      </body>
      </html>
    `;
  }

  async getStudentReportCards(studentId: string, requestingUserId: string) {
    // Verify relation: requesting user must be the student, or linked guardian, or staff
    const student = await this.db.student.findUnique({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Student not found');

    if (student.userId !== requestingUserId) {
      const isGuardian = await this.db.guardianStudent.findFirst({
        where: { studentId, guardian: { userId: requestingUserId } },
      });
      if (!isGuardian) {
        throw new ForbiddenException('You are not authorized to access this student report card');
      }
    }

    return this.db.reportCard.findMany({
      where: { studentId },
      include: { academicYear: true, class: true, section: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
