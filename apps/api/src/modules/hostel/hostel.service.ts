import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';
import { Prisma, BedStatus, OutpassStatus, HostelInspectionStatus, HostelVisitorStatus, HostelMessStatus, HostelTransferStatus } from '@prisma/client';

@Injectable()
export class HostelService {
  constructor(private readonly db: DatabaseService, private readonly audit: AuditService) {}

  private async assertSchool(organizationId: string, schoolId: string) {
    const school = await this.db.school.findFirst({ where: { id: schoolId, organizationId }, select: { id: true } });
    if (!school) throw new NotFoundException('School not found');
    return school;
  }

  private async assertHostel(organizationId: string, schoolId: string, hostelId: string) {
    const hostel = await this.db.hostel.findFirst({ where: { id: hostelId, schoolId, school: { organizationId } } });
    if (!hostel) throw new NotFoundException('Hostel not found for this school');
    return hostel;
  }

  async createHostel(organizationId: string, data: any, actorId: string) {
    await this.assertSchool(organizationId, data.schoolId);
    const hostel = await this.db.hostel.create({ data: { name: data.name, type: data.type, schoolId: data.schoolId, campusId: data.campusId } });
    await this.audit.log({ action: 'hostel.create', resource: 'Hostel', resourceId: hostel.id, actorId, organizationId });
    return hostel;
  }

  async allocateBed(organizationId: string, data: any, actorId: string) {
    await this.assertSchool(organizationId, data.schoolId);
    return this.db.$transaction(async (tx) => {
      const [bed, hostel, student, year] = await Promise.all([
        tx.hostelBed.findFirst({ where: { id: data.bedId, room: { floor: { building: { hostel: { id: data.hostelId, schoolId: data.schoolId, school: { organizationId } } } } } } }),
        tx.hostel.findFirst({ where: { id: data.hostelId, schoolId: data.schoolId, school: { organizationId } } }),
        tx.student.findFirst({ where: { id: data.studentId, schoolId: data.schoolId } }),
        tx.academicYear.findFirst({ where: { id: data.academicYearId, schoolId: data.schoolId } }),
      ]);
      if (!hostel) throw new NotFoundException('Hostel not found');
      if (!bed || bed.status !== BedStatus.AVAILABLE) throw new BadRequestException('Bed is not available');
      if (!student) throw new NotFoundException('Student does not belong to this school');
      if (!year) throw new NotFoundException('Academic year does not belong to this school');
      const existing = await tx.hostelAllocation.findFirst({ where: { studentId: data.studentId, academicYearId: data.academicYearId, isActive: true } });
      if (existing) throw new BadRequestException('Student already has an active hostel allocation');
      const allocation = await tx.hostelAllocation.create({ data: { studentId: data.studentId, hostelId: data.hostelId, bedId: data.bedId, academicYearId: data.academicYearId, startDate: new Date(data.startDate), isActive: true } });
      await tx.hostelBed.update({ where: { id: data.bedId }, data: { status: BedStatus.ALLOCATED } });
      await this.audit.log({ action: 'hostel.allocate', resource: 'HostelAllocation', resourceId: allocation.id, actorId, organizationId });
      return allocation;
    });
  }

  async requestOutpass(userId: string, data: any) {
    const allocation = await this.db.hostelAllocation.findFirst({ where: { student: { userId }, isActive: true } });
    if (!allocation) throw new NotFoundException('Active hostel allocation not found');
    if (new Date(data.expectedReturn) <= new Date(data.departureDate)) throw new BadRequestException('Expected return must be after departure');
    return this.db.hostelOutpass.create({ data: { allocationId: allocation.id, reason: data.reason, departureDate: new Date(data.departureDate), expectedReturn: new Date(data.expectedReturn), status: OutpassStatus.PENDING } });
  }

  async getDashboard(organizationId: string, schoolId: string) {
    await this.assertSchool(organizationId, schoolId);
    const today = new Date(); today.setHours(0,0,0,0);
    const [residents, rooms, availableBeds, activeOutpasses, overdueOutpasses, openIncidents, todayMess, inspectionsDue] = await Promise.all([
      this.db.hostelAllocation.count({ where: { hostel: { schoolId, school: { organizationId } }, isActive: true } }),
      this.db.hostelRoom.count({ where: { floor: { building: { hostel: { schoolId, school: { organizationId } } } } } }),
      this.db.hostelBed.count({ where: { room: { floor: { building: { hostel: { schoolId, school: { organizationId } } } } }, status: BedStatus.AVAILABLE } }),
      this.db.hostelOutpass.count({ where: { allocation: { hostel: { schoolId, school: { organizationId } } }, status: { in: [OutpassStatus.APPROVED, OutpassStatus.DEPARTED] } } }),
      this.db.hostelOutpass.count({ where: { allocation: { hostel: { schoolId, school: { organizationId } } }, status: OutpassStatus.APPROVED, expectedReturn: { lt: new Date() } } }),
      this.db.hostelIncident.count({ where: { hostel: { schoolId, school: { organizationId } }, status: { not: 'CLOSED' } } }),
      this.db.hostelMessAttendance.count({ where: { schoolId, school: { organizationId }, date: { gte: today } } }),
      this.db.hostelRoomInspection.count({ where: { schoolId, school: { organizationId }, status: { in: [HostelInspectionStatus.SCHEDULED, HostelInspectionStatus.IN_PROGRESS] } } }),
    ]);
    return { totalResidents: residents, totalRooms: rooms, availableBeds, activeOutpasses, overdueOutpasses, openIncidents, todayMessRecords: todayMess, inspectionsDue };
  }

  async findAllHostels(organizationId: string, schoolId: string) {
    await this.assertSchool(organizationId, schoolId);
    return this.db.hostel.findMany({ where: { schoolId, school: { organizationId } }, include: { buildings: { include: { floors: { include: { rooms: { include: { beds: true } } } } } } } });
  }

  async getStudentHostelInfo(userId: string) {
    return this.db.hostelAllocation.findFirst({ where: { student: { userId }, isActive: true }, include: { hostel: true, bed: { include: { room: { include: { floor: { include: { building: true } } } } } } } });
  }

  async createInspection(organizationId: string, data: any, actorId: string) {
    await this.assertHostel(organizationId, data.schoolId, data.hostelId);
    const room = await this.db.hostelRoom.findFirst({ where: { id: data.roomId, floor: { building: { hostel: { id: data.hostelId, schoolId: data.schoolId, school: { organizationId } } } } } });
    if (!room) throw new NotFoundException('Room not found in hostel');
    const inspection = await this.db.hostelRoomInspection.create({ data: { schoolId: data.schoolId, hostelId: data.hostelId, roomId: data.roomId, inspectorId: actorId, scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null, status: HostelInspectionStatus.SCHEDULED } });
    await this.audit.log({ action: 'hostel.inspection.create', resource: 'HostelRoomInspection', resourceId: inspection.id, actorId, organizationId });
    return inspection;
  }

  async completeInspection(organizationId: string, inspectionId: string, data: any, actorId: string) {
    const inspection = await this.db.hostelRoomInspection.findFirst({ where: { id: inspectionId, school: { organizationId } } });
    if (!inspection) throw new NotFoundException('Inspection not found');
    if (inspection.status === HostelInspectionStatus.COMPLETED) throw new BadRequestException('Inspection already completed');
    if (data.score != null && (Number(data.score) < 0 || Number(data.score) > 100)) throw new BadRequestException('Score must be between 0 and 100');
    const updated = await this.db.hostelRoomInspection.update({ where: { id: inspectionId }, data: { status: HostelInspectionStatus.COMPLETED, score: data.score == null ? null : Number(data.score), findings: data.findings, actionItems: data.actionItems ?? undefined, completedAt: new Date() } });
    await this.audit.log({ action: 'hostel.inspection.complete', resource: 'HostelRoomInspection', resourceId: inspectionId, actorId, organizationId });
    return updated;
  }

  async registerVisitor(organizationId: string, data: any, actorId: string) {
    await this.assertHostel(organizationId, data.schoolId, data.hostelId);
    if (data.studentId) {
      const student = await this.db.student.findFirst({ where: { id: data.studentId, schoolId: data.schoolId } });
      if (!student) throw new NotFoundException('Student not found in this school');
    }
    const visitor = await this.db.hostelVisitor.create({ data: { schoolId: data.schoolId, hostelId: data.hostelId, studentId: data.studentId, visitorName: data.visitorName, relationship: data.relationship, phone: data.phone, idType: data.idType, idReference: data.idReference, purpose: data.purpose, expectedAt: data.expectedAt ? new Date(data.expectedAt) : null, approvedById: actorId, notes: data.notes } });
    await this.audit.log({ action: 'hostel.visitor.register', resource: 'HostelVisitor', resourceId: visitor.id, actorId, organizationId });
    return visitor;
  }

  async checkoutVisitor(organizationId: string, visitorId: string, actorId: string) {
    const visitor = await this.db.hostelVisitor.findFirst({ where: { id: visitorId, school: { organizationId } } });
    if (!visitor) throw new NotFoundException('Visitor not found');
    if (visitor.status !== HostelVisitorStatus.CHECKED_IN && visitor.status !== HostelVisitorStatus.EXPECTED) throw new BadRequestException('Visitor cannot be checked out');
    const updated = await this.db.hostelVisitor.update({ where: { id: visitorId }, data: { status: HostelVisitorStatus.CHECKED_OUT, checkedOutAt: new Date(), checkedInAt: visitor.checkedInAt ?? new Date() } });
    await this.audit.log({ action: 'hostel.visitor.checkout', resource: 'HostelVisitor', resourceId: visitorId, actorId, organizationId });
    return updated;
  }

  async markMess(organizationId: string, data: any, actorId: string) {
    await this.assertHostel(organizationId, data.schoolId, data.hostelId);
    const allocation = await this.db.hostelAllocation.findFirst({ where: { id: data.allocationId, hostelId: data.hostelId, isActive: true, hostel: { schoolId: data.schoolId, school: { organizationId } } } });
    if (!allocation) throw new NotFoundException('Active allocation not found');
    const date = new Date(data.date); date.setHours(0,0,0,0);
    const record = await this.db.hostelMessAttendance.upsert({ where: { allocationId_date_meal: { allocationId: allocation.id, date, meal: data.meal } }, create: { schoolId: data.schoolId, hostelId: data.hostelId, allocationId: allocation.id, date, meal: data.meal, status: data.status || HostelMessStatus.SERVED, markedById: actorId, remarks: data.remarks }, update: { status: data.status || HostelMessStatus.SERVED, markedById: actorId, remarks: data.remarks } });
    return record;
  }

  async requestTransfer(organizationId: string, data: any, actorId: string) {
    await this.assertHostel(organizationId, data.schoolId, data.hostelId);
    const from = await this.db.hostelAllocation.findFirst({ where: { id: data.allocationId, hostelId: data.hostelId, isActive: true, hostel: { schoolId: data.schoolId, school: { organizationId } } } });
    const toBed = await this.db.hostelBed.findFirst({ where: { id: data.toBedId, status: BedStatus.AVAILABLE, room: { floor: { building: { hostel: { id: data.hostelId, schoolId: data.schoolId, school: { organizationId } } } } } } });
    if (!from) throw new NotFoundException('Active allocation not found');
    if (!toBed) throw new BadRequestException('Destination bed is not available');
    if (from.bedId === toBed.id) throw new BadRequestException('Destination bed is the current bed');
    const transfer = await this.db.hostelAllocationTransfer.create({ data: { schoolId: data.schoolId, hostelId: data.hostelId, allocationId: from.id, fromBedId: from.bedId, toBedId: toBed.id, reason: data.reason, requestedById: actorId } });
    await this.audit.log({ action: 'hostel.transfer.request', resource: 'HostelAllocationTransfer', resourceId: transfer.id, actorId, organizationId });
    return transfer;
  }

  async completeTransfer(organizationId: string, transferId: string, actorId: string) {
    return this.db.$transaction(async (tx) => {
      const transfer = await tx.hostelAllocationTransfer.findFirst({ where: { id: transferId, school: { organizationId } } });
      if (!transfer) throw new NotFoundException('Transfer request not found');
      if (transfer.status !== HostelTransferStatus.REQUESTED && transfer.status !== HostelTransferStatus.APPROVED) throw new BadRequestException('Transfer is not actionable');
      const toBed = await tx.hostelBed.findFirst({ where: { id: transfer.toBedId, status: BedStatus.AVAILABLE } });
      const from = await tx.hostelAllocation.findFirst({ where: { id: transfer.allocationId, isActive: true } });
      if (!toBed || !from) throw new BadRequestException('Transfer allocation or destination bed is no longer available');
      await tx.hostelAllocation.update({ where: { id: from.id }, data: { isActive: false, endDate: new Date() } });
      const next = await tx.hostelAllocation.create({ data: { studentId: from.studentId, hostelId: from.hostelId, bedId: toBed.id, academicYearId: from.academicYearId, startDate: new Date(), isActive: true } });
      await tx.hostelBed.update({ where: { id: from.bedId }, data: { status: BedStatus.AVAILABLE } });
      await tx.hostelBed.update({ where: { id: toBed.id }, data: { status: BedStatus.ALLOCATED } });
      const updated = await tx.hostelAllocationTransfer.update({ where: { id: transfer.id }, data: { status: HostelTransferStatus.COMPLETED, toAllocationId: next.id, approvedById: actorId, completedAt: new Date() } });
      await this.audit.log({ action: 'hostel.transfer.complete', resource: 'HostelAllocationTransfer', resourceId: transfer.id, actorId, organizationId });
      return updated;
    });
  }

  async listOperations(organizationId: string, schoolId: string) {
    await this.assertSchool(organizationId, schoolId);
    const [inspections, visitors, transfers] = await Promise.all([
      this.db.hostelRoomInspection.findMany({ where: { schoolId }, include: { room: true, hostel: true }, orderBy: { createdAt: 'desc' }, take: 50 }),
      this.db.hostelVisitor.findMany({ where: { schoolId }, include: { hostel: true }, orderBy: { createdAt: 'desc' }, take: 50 }),
      this.db.hostelAllocationTransfer.findMany({ where: { schoolId }, include: { hostel: true, fromAllocation: { include: { student: true, bed: true } }, toAllocation: true }, orderBy: { createdAt: 'desc' }, take: 50 }),
    ]);
    return { inspections, visitors, transfers };
  }
}
