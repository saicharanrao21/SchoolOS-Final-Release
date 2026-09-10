import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { Prisma, AdmissionStatus, FollowUpMethod, FollowUpOutcome } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class EnquiriesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
    private readonly events: EventEmitter2,
  ) {}

  async create(organizationId: string, data: any, actorId?: string) {
    const school = await this.db.school.findFirst({
      where: { id: data.schoolId, organizationId },
    });
    if (!school) throw new NotFoundException('School not found');

    const enquiryNumber = await this.generateEnquiryNumber(school.id, school.code || 'SCH');

    const enquiry = await this.db.admissionEnquiry.create({
      data: {
        enquiryNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender,
        interestedClassId: data.interestedClassId,
        academicYearId: data.academicYearId,
        campusId: data.campusId,
        source: data.source || 'OTHER',
        notes: data.notes,
        assignedToId: data.assignedToId,
        schoolId: school.id,
      },
    });

    await this.audit.log({ action: 'admission.enquiry.create', resource: 'AdmissionEnquiry', resourceId: enquiry.id, actorId, organizationId, schoolId: school.id, metadata: { enquiryNumber } });
    this.events.emit('admissions.enquiry.created', { enquiryId: enquiry.id, organizationId, schoolId: school.id });
    return enquiry;
  }

  private async generateEnquiryNumber(schoolId: string, schoolCode: string): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    const count = await this.db.admissionEnquiry.count({ where: { schoolId } });
    return `ENQ-${schoolCode}${year}${(count + 1).toString().padStart(4, '0')}`;
  }

  async findAll(organizationId: string, filters: any) {
    const { page = 1, limit = 10, search, status, schoolId } = filters;
    const parsedLimit = Math.min(Math.max(parseInt(limit.toString(), 10) || 10, 1), 100);
    const parsedPage = Math.max(parseInt(page.toString(), 10) || 1, 1);
    const skip = (parsedPage - 1) * parsedLimit;
    const where: Prisma.AdmissionEnquiryWhereInput = { school: { organizationId } };
    if (schoolId) {
      const school = await this.db.school.findFirst({ where: { id: schoolId, organizationId }, select: { id: true } });
      if (!school) throw new NotFoundException('School not found');
      where.schoolId = school.id;
    }
    if (status) where.status = status;
    if (search) where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
      { enquiryNumber: { contains: search, mode: 'insensitive' } },
    ];
    const [items, total] = await Promise.all([
      this.db.admissionEnquiry.findMany({ where, skip, take: parsedLimit, orderBy: { createdAt: 'desc' }, include: { assignedTo: { select: { id: true, firstName: true, lastName: true } }, followUps: { orderBy: { scheduledDate: 'desc' }, take: 1 } } }),
      this.db.admissionEnquiry.count({ where }),
    ]);
    return { items, meta: { total, page: parsedPage, limit: parsedLimit, totalPages: Math.ceil(total / parsedLimit) } };
  }

  async findOne(organizationId: string, id: string) {
    const enquiry = await this.db.admissionEnquiry.findFirst({
      where: { id, school: { organizationId } },
      include: { followUps: { include: { staff: { select: { id: true, firstName: true, lastName: true } } }, orderBy: { scheduledDate: 'asc' } }, applications: true, assignedTo: { select: { id: true, firstName: true, lastName: true } } },
    });
    if (!enquiry) throw new NotFoundException('Enquiry not found');
    return enquiry;
  }

  async addFollowUp(organizationId: string, enquiryId: string, data: any, actorId: string) {
    const enquiry = await this.findOne(organizationId, enquiryId);
    const scheduledDate = new Date(data.scheduledDate);
    if (Number.isNaN(scheduledDate.getTime())) throw new BadRequestException('Invalid scheduledDate');
    if (scheduledDate.getTime() < Date.now() && data.status !== 'COMPLETED') throw new BadRequestException('Scheduled follow-up cannot be in the past');

    const staff = await this.db.user.findFirst({ where: { id: actorId, organizationId }, select: { id: true } });
    if (!staff) throw new NotFoundException('Staff user not found');

    const followUp = await this.db.admissionFollowUp.create({
      data: { enquiryId: enquiry.id, scheduledDate, actualDate: data.actualDate ? new Date(data.actualDate) : null, method: data.method as FollowUpMethod, purpose: data.purpose, notes: data.notes, outcome: data.outcome as FollowUpOutcome | undefined, nextFollowUpDate: data.nextFollowUpDate ? new Date(data.nextFollowUpDate) : null, status: data.status || 'PENDING', staffId: actorId },
    });
    await this.db.admissionEnquiry.update({ where: { id: enquiry.id }, data: { status: data.outcome === 'CONVERTED' ? AdmissionStatus.APPLICATION : AdmissionStatus.FOLLOW_UP } });
    await this.audit.log({ action: 'admission.follow_up.create', resource: 'AdmissionFollowUp', resourceId: followUp.id, actorId, organizationId, schoolId: enquiry.schoolId, metadata: { enquiryId } });
    return followUp;
  }

  async completeFollowUp(organizationId: string, enquiryId: string, followUpId: string, data: any, actorId: string) {
    const enquiry = await this.findOne(organizationId, enquiryId);
    const followUp = await this.db.admissionFollowUp.findFirst({ where: { id: followUpId, enquiryId: enquiry.id, enquiry: { school: { organizationId } } } });
    if (!followUp) throw new NotFoundException('Follow-up not found');
    if (followUp.status === 'COMPLETED') throw new BadRequestException('Follow-up already completed');
    const actualDate = data.actualDate ? new Date(data.actualDate) : new Date();
    if (Number.isNaN(actualDate.getTime())) throw new BadRequestException('Invalid actualDate');

    const updated = await this.db.admissionFollowUp.update({ where: { id: followUp.id }, data: { status: 'COMPLETED', actualDate, outcome: data.outcome as FollowUpOutcome | undefined, notes: data.notes ?? followUp.notes, nextFollowUpDate: data.nextFollowUpDate ? new Date(data.nextFollowUpDate) : null } });
    const nextStatus = data.outcome === 'CONVERTED' ? AdmissionStatus.APPLICATION : data.outcome === 'NOT_INTERESTED' ? AdmissionStatus.REJECTED : data.nextFollowUpDate ? AdmissionStatus.FOLLOW_UP : enquiry.status;
    if (nextStatus !== enquiry.status) await this.db.admissionEnquiry.update({ where: { id: enquiry.id }, data: { status: nextStatus } });
    await this.audit.log({ action: 'admission.follow_up.complete', resource: 'AdmissionFollowUp', resourceId: followUp.id, actorId, organizationId, schoolId: enquiry.schoolId, metadata: { enquiryId, outcome: data.outcome, nextFollowUpDate: data.nextFollowUpDate } });
    this.events.emit('admissions.follow_up.completed', { followUpId: followUp.id, enquiryId: enquiry.id, organizationId, schoolId: enquiry.schoolId, outcome: data.outcome });
    return updated;
  }

  async getCrmDashboard(organizationId: string, schoolId?: string) {
    const schoolFilter = schoolId ? { schoolId } : undefined;
    if (schoolId) {
      const school = await this.db.school.findFirst({ where: { id: schoolId, organizationId }, select: { id: true } });
      if (!school) throw new NotFoundException('School not found');
    }
    const base: Prisma.AdmissionEnquiryWhereInput = { school: { organizationId }, ...schoolFilter };
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const [total, open, applications, converted, followUpsDue, overdueFollowUps, sourceRows] = await Promise.all([
      this.db.admissionEnquiry.count({ where: base }),
      this.db.admissionEnquiry.count({ where: { ...base, status: { notIn: [AdmissionStatus.REJECTED, AdmissionStatus.ENROLLED] } } }),
      this.db.admissionApplication.count({ where: { school: { organizationId }, ...(schoolId ? { schoolId } : {}) } }),
      this.db.admissionApplication.count({ where: { school: { organizationId }, status: AdmissionStatus.ENROLLED, ...(schoolId ? { schoolId } : {}) } }),
      this.db.admissionFollowUp.count({ where: { enquiry: base, status: 'PENDING', scheduledDate: { gte: now, lte: tomorrow } } }),
      this.db.admissionFollowUp.count({ where: { enquiry: base, status: 'PENDING', scheduledDate: { lt: now } } }),
      this.db.admissionEnquiry.groupBy({ by: ['source'], where: base, _count: { _all: true } }),
    ]);
    return { totalEnquiries: total, openEnquiries: open, applications, enrolled: converted, followUpsDueNext24h: followUpsDue, overdueFollowUps, conversionRate: applications ? Number(((converted / applications) * 100).toFixed(2)) : 0, bySource: sourceRows.map((row) => ({ source: row.source, count: row._count._all })) };
  }

  async getFollowUpQueue(organizationId: string, schoolId?: string) {
    const enquiry: Prisma.AdmissionEnquiryWhereInput = { school: { organizationId }, ...(schoolId ? { schoolId } : {}) };
    if (schoolId) {
      const school = await this.db.school.findFirst({ where: { id: schoolId, organizationId }, select: { id: true } });
      if (!school) throw new NotFoundException('School not found');
    }
    return this.db.admissionFollowUp.findMany({ where: { enquiry, status: 'PENDING' }, orderBy: { scheduledDate: 'asc' }, include: { enquiry: { select: { id: true, enquiryNumber: true, firstName: true, lastName: true, phone: true, status: true, schoolId: true } }, staff: { select: { id: true, firstName: true, lastName: true } } } });
  }
}
