import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { DocumentStatus, PerformanceReviewStatus } from '@prisma/client';

@Injectable()
export class HrComplianceService {
  constructor(private readonly db: DatabaseService, private readonly audit: AuditService) {}

  private async employeeInSchool(organizationId: string, employeeId: string, schoolId?: string) {
    const employee = await this.db.employee.findFirst({
      where: { id: employeeId, ...(schoolId ? { schoolId } : {}), school: { organizationId } },
    });
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async listDocuments(organizationId: string, schoolId: string, employeeId?: string) {
    await this.assertSchool(organizationId, schoolId);
    return this.db.employeeDocument.findMany({
      where: { schoolId, ...(employeeId ? { employeeId } : {}) },
      orderBy: [{ expiryDate: 'asc' }, { createdAt: 'desc' }],
      include: { employee: { select: { id: true, employeeId: true, firstName: true, lastName: true } } },
    });
  }

  async createDocument(organizationId: string, data: any, actorId: string) {
    await this.employeeInSchool(organizationId, data.employeeId, data.schoolId);
    const doc = await this.db.employeeDocument.create({
      data: {
        employeeId: data.employeeId, schoolId: data.schoolId, documentType: data.documentType,
        documentNumber: data.documentNumber, title: data.title, fileUrl: data.fileUrl,
        issuedDate: data.issuedDate ? new Date(data.issuedDate) : null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        notes: data.notes, status: data.status || DocumentStatus.ACTIVE,
      },
    });
    await this.audit.log({ action: 'hr.employee_document.create', resource: 'EmployeeDocument', resourceId: doc.id, actorId, organizationId });
    return doc;
  }

  async verifyDocument(organizationId: string, id: string, actorId: string) {
    const doc = await this.db.employeeDocument.findFirst({ where: { id, school: { organizationId } } });
    if (!doc) throw new NotFoundException('Employee document not found');
    const updated = await this.db.employeeDocument.update({ where: { id }, data: { verified: true, verifiedById: actorId, verifiedAt: new Date() } });
    await this.audit.log({ action: 'hr.employee_document.verify', resource: 'EmployeeDocument', resourceId: id, actorId, organizationId });
    return updated;
  }

  async listExpiringDocuments(organizationId: string, schoolId: string, days = 30) {
    await this.assertSchool(organizationId, schoolId);
    const end = new Date(Date.now() + Math.max(1, days) * 86400000);
    return this.db.employeeDocument.findMany({ where: { schoolId, expiryDate: { not: null, lte: end, gte: new Date() }, status: { not: DocumentStatus.DELETED } }, orderBy: { expiryDate: 'asc' }, include: { employee: true } });
  }

  async createReview(organizationId: string, data: any, actorId: string) {
    const employee = await this.employeeInSchool(organizationId, data.employeeId, data.schoolId);
    const reviewer = await this.employeeInSchool(organizationId, data.reviewerId, data.schoolId);
    if (employee.id === reviewer.id) throw new BadRequestException('An employee cannot be their own reviewer');
    if (data.overallRating != null && (Number(data.overallRating) < 0 || Number(data.overallRating) > 5)) throw new BadRequestException('Rating must be between 0 and 5');
    const review = await this.db.performanceReview.create({ data: { employeeId: employee.id, reviewerId: reviewer.id, schoolId: data.schoolId, reviewPeriod: data.reviewPeriod, reviewDate: new Date(data.reviewDate), overallRating: data.overallRating == null ? null : Number(data.overallRating), strengths: data.strengths, improvements: data.improvements, goals: data.goals, managerComment: data.managerComment } });
    await this.audit.log({ action: 'hr.performance_review.create', resource: 'PerformanceReview', resourceId: review.id, actorId, organizationId });
    return review;
  }

  async updateReview(organizationId: string, id: string, data: any, actorId: string) {
    const review = await this.db.performanceReview.findFirst({ where: { id, school: { organizationId } } });
    if (!review) throw new NotFoundException('Performance review not found');
    if (review.status === PerformanceReviewStatus.COMPLETED || review.status === PerformanceReviewStatus.CANCELLED) throw new BadRequestException('Completed or cancelled reviews cannot be modified');
    if (data.overallRating != null && (Number(data.overallRating) < 0 || Number(data.overallRating) > 5)) throw new BadRequestException('Rating must be between 0 and 5');
    const updated = await this.db.performanceReview.update({
      where: { id },
      data: {
        reviewPeriod: data.reviewPeriod,
        reviewDate: data.reviewDate ? new Date(data.reviewDate) : undefined,
        overallRating: data.overallRating == null ? undefined : Number(data.overallRating),
        strengths: data.strengths,
        improvements: data.improvements,
        goals: data.goals,
        managerComment: data.managerComment,
        employeeComment: data.employeeComment,
        status: data.status as PerformanceReviewStatus | undefined,
        acknowledgedAt: data.status === PerformanceReviewStatus.ACKNOWLEDGED ? new Date() : undefined,
        completedAt: data.status === PerformanceReviewStatus.COMPLETED ? new Date() : undefined,
      },
    });
    await this.audit.log({ action: 'hr.performance_review.update', resource: 'PerformanceReview', resourceId: id, actorId, organizationId });
    return updated;
  }

  async listReviews(organizationId: string, schoolId: string, employeeId?: string) {
    await this.assertSchool(organizationId, schoolId);
    return this.db.performanceReview.findMany({ where: { schoolId, ...(employeeId ? { employeeId } : {}) }, include: { employee: true, reviewer: true }, orderBy: { reviewDate: 'desc' } });
  }

  async createTraining(organizationId: string, data: any, actorId: string) {
    await this.employeeInSchool(organizationId, data.employeeId, data.schoolId);
    if (data.endDate && new Date(data.endDate) < new Date(data.startDate)) throw new BadRequestException('Training end date cannot precede start date');
    const training = await this.db.employeeTraining.create({ data: { employeeId: data.employeeId, schoolId: data.schoolId, title: data.title, provider: data.provider, category: data.category, startDate: new Date(data.startDate), endDate: data.endDate ? new Date(data.endDate) : null, completionDate: data.completionDate ? new Date(data.completionDate) : null, certificateUrl: data.certificateUrl, status: data.status || 'PLANNED', hours: data.hours, cost: data.cost, notes: data.notes } });
    await this.audit.log({ action: 'hr.training.create', resource: 'EmployeeTraining', resourceId: training.id, actorId, organizationId });
    return training;
  }

  async listTrainings(organizationId: string, schoolId: string, employeeId?: string) {
    await this.assertSchool(organizationId, schoolId);
    return this.db.employeeTraining.findMany({ where: { schoolId, ...(employeeId ? { employeeId } : {}) }, include: { employee: { select: { employeeId: true, firstName: true, lastName: true } } }, orderBy: { startDate: 'desc' } });
  }

  async getHrComplianceSummary(organizationId: string, schoolId: string) {
    await this.assertSchool(organizationId, schoolId);
    const [employees, activeDocuments, expiringDocuments, pendingReviews, completedTrainings] = await Promise.all([
      this.db.employee.count({ where: { schoolId, isActive: true } }),
      this.db.employeeDocument.count({ where: { schoolId, status: DocumentStatus.ACTIVE, verified: true } }),
      this.db.employeeDocument.count({ where: { schoolId, expiryDate: { not: null, gte: new Date(), lte: new Date(Date.now() + 30 * 86400000) }, status: { not: DocumentStatus.DELETED } } }),
      this.db.performanceReview.count({ where: { schoolId, status: { in: [PerformanceReviewStatus.DRAFT, PerformanceReviewStatus.SUBMITTED] } } }),
      this.db.employeeTraining.count({ where: { schoolId, status: 'COMPLETED' } }),
    ]);
    return { employees, activeDocuments, expiringDocuments, pendingReviews, completedTrainings };
  }

  private async assertSchool(organizationId: string, schoolId: string) {
    const school = await this.db.school.findFirst({ where: { id: schoolId, organizationId } });
    if (!school) throw new NotFoundException('School not found');
  }
}
