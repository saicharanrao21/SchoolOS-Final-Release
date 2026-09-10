import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';
import { MedicationStatus, MedicalVisitOutcome, MedicalVisitType } from '@prisma/client';

@Injectable()
export class StudentHealthService {
  constructor(private readonly db: DatabaseService, private readonly audit: AuditService) {}

  async getProfile(organizationId: string, schoolId: string, studentId: string) {
    await this.assertStudent(organizationId, schoolId, studentId);
    return this.db.studentMedicalProfile.findUnique({ where: { studentId } });
  }

  async upsertProfile(organizationId: string, schoolId: string, studentId: string, actorId: string, data: any) {
    await this.assertStudent(organizationId, schoolId, studentId);
    const profile = await this.db.studentMedicalProfile.upsert({
      where: { studentId },
      update: {
        allergies: this.stringArray(data.allergies),
        chronicConditions: this.stringArray(data.chronicConditions),
        emergencyInstructions: this.clean(data.emergencyInstructions),
        primaryDoctorName: this.clean(data.primaryDoctorName),
        primaryDoctorPhone: this.clean(data.primaryDoctorPhone),
        insuranceProvider: this.clean(data.insuranceProvider),
        insurancePolicyNumber: this.clean(data.insurancePolicyNumber),
        treatmentConsent: Boolean(data.treatmentConsent),
        consentUpdatedAt: new Date(),
      },
      create: {
        studentId,
        schoolId,
        allergies: this.stringArray(data.allergies),
        chronicConditions: this.stringArray(data.chronicConditions),
        emergencyInstructions: this.clean(data.emergencyInstructions),
        primaryDoctorName: this.clean(data.primaryDoctorName),
        primaryDoctorPhone: this.clean(data.primaryDoctorPhone),
        insuranceProvider: this.clean(data.insuranceProvider),
        insurancePolicyNumber: this.clean(data.insurancePolicyNumber),
        treatmentConsent: Boolean(data.treatmentConsent),
        consentUpdatedAt: new Date(),
      },
    });
    await this.audit.log({ action: 'health.profile.upsert', resource: 'StudentMedicalProfile', resourceId: profile.id, actorId, organizationId, schoolId, studentId, metadata: { treatmentConsent: profile.treatmentConsent } });
    return profile;
  }

  async listVisits(organizationId: string, schoolId: string, studentId: string, from?: string, to?: string) {
    await this.assertStudent(organizationId, schoolId, studentId);
    const visitedAt: any = {};
    if (from) visitedAt.gte = new Date(from);
    if (to) visitedAt.lte = new Date(to);
    return this.db.studentMedicalVisit.findMany({ where: { schoolId, studentId, ...(Object.keys(visitedAt).length ? { visitedAt } : {}) }, orderBy: { visitedAt: 'desc' }, take: 100 });
  }

  async recordVisit(organizationId: string, schoolId: string, studentId: string, actorId: string, data: any) {
    await this.assertStudent(organizationId, schoolId, studentId);
    const visitType = this.enumValue(MedicalVisitType, data.visitType, 'visitType');
    const outcome = this.enumValue(MedicalVisitOutcome, data.outcome, 'outcome');
    const visit = await this.db.studentMedicalVisit.create({
      data: {
        studentId, schoolId, recordedById: actorId, visitType, outcome,
        symptoms: this.clean(data.symptoms), diagnosis: this.clean(data.diagnosis), treatment: this.clean(data.treatment),
        medicationsGiven: data.medicationsGiven ?? undefined,
        temperature: data.temperature === undefined || data.temperature === null ? undefined : Number(data.temperature),
        referredTo: this.clean(data.referredTo), guardianNotified: Boolean(data.guardianNotified),
        guardianNotifiedAt: data.guardianNotified ? new Date() : undefined,
        notes: this.clean(data.notes), visitedAt: data.visitedAt ? new Date(data.visitedAt) : new Date(),
      },
    });
    await this.audit.log({ action: 'health.visit.record', resource: 'StudentMedicalVisit', resourceId: visit.id, actorId, organizationId, schoolId, studentId, metadata: { visitType, outcome, guardianNotified: visit.guardianNotified } });
    return visit;
  }

  async listMedications(organizationId: string, schoolId: string, studentId: string, activeOnly = false) {
    await this.assertStudent(organizationId, schoolId, studentId);
    return this.db.studentMedication.findMany({ where: { schoolId, studentId, ...(activeOnly ? { status: MedicationStatus.ACTIVE } : {}) }, orderBy: [{ status: 'asc' }, { startDate: 'desc' }] });
  }

  async addMedication(organizationId: string, schoolId: string, studentId: string, actorId: string, data: any) {
    await this.assertStudent(organizationId, schoolId, studentId);
    for (const field of ['name', 'dosage', 'frequency', 'startDate']) {
      if (!data[field]) throw new BadRequestException(`${field} is required`);
    }
    const medication = await this.db.studentMedication.create({
      data: {
        studentId, schoolId, name: String(data.name).trim(), dosage: String(data.dosage).trim(), frequency: String(data.frequency).trim(),
        route: this.clean(data.route), instructions: this.clean(data.instructions), prescribedBy: this.clean(data.prescribedBy),
        startDate: new Date(data.startDate), endDate: data.endDate ? new Date(data.endDate) : undefined,
        status: MedicationStatus.ACTIVE,
      },
    });
    await this.audit.log({ action: 'health.medication.create', resource: 'StudentMedication', resourceId: medication.id, actorId, organizationId, schoolId, studentId, metadata: { name: medication.name } });
    return medication;
  }

  async updateMedication(organizationId: string, schoolId: string, id: string, actorId: string, data: any) {
    const existing = await this.db.studentMedication.findFirst({ where: { id, schoolId, school: { organizationId } } });
    if (!existing) throw new NotFoundException('Medication record not found');
    const status = data.status ? this.enumValue(MedicationStatus, data.status, 'status') : undefined;
    const medication = await this.db.studentMedication.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: String(data.name).trim() } : {}),
        ...(data.dosage !== undefined ? { dosage: String(data.dosage).trim() } : {}),
        ...(data.frequency !== undefined ? { frequency: String(data.frequency).trim() } : {}),
        ...(data.route !== undefined ? { route: this.clean(data.route) } : {}),
        ...(data.instructions !== undefined ? { instructions: this.clean(data.instructions) } : {}),
        ...(data.endDate !== undefined ? { endDate: data.endDate ? new Date(data.endDate) : null } : {}),
        ...(status ? { status } : {}),
      },
    });
    await this.audit.log({ action: 'health.medication.update', resource: 'StudentMedication', resourceId: id, actorId, organizationId, schoolId, studentId: existing.studentId, metadata: { status: medication.status } });
    return medication;
  }

  async dashboard(organizationId: string, schoolId: string) {
    await this.assertSchool(organizationId, schoolId);
    const [profiles, visitsToday, activeMedications, emergencies] = await Promise.all([
      this.db.studentMedicalProfile.count({ where: { schoolId } }),
      this.db.studentMedicalVisit.count({ where: { schoolId, visitedAt: { gte: this.startOfToday() } } }),
      this.db.studentMedication.count({ where: { schoolId, status: MedicationStatus.ACTIVE } }),
      this.db.studentMedicalVisit.count({ where: { schoolId, visitType: MedicalVisitType.EMERGENCY, visitedAt: { gte: this.startOfToday() } } }),
    ]);
    return { profiles, visitsToday, activeMedications, emergenciesToday: emergencies };
  }

  private async assertSchool(organizationId: string, schoolId: string) {
    const school = await this.db.school.findFirst({ where: { id: schoolId, organizationId }, select: { id: true } });
    if (!school) throw new NotFoundException('School not found in the current organization');
  }

  private async assertStudent(organizationId: string, schoolId: string, studentId: string) {
    const student = await this.db.student.findFirst({ where: { id: studentId, schoolId, school: { organizationId } }, select: { id: true } });
    if (!student) throw new NotFoundException('Student not found in the current school');
  }

  private clean(value: unknown) { return value === undefined || value === null || String(value).trim() === '' ? undefined : String(value).trim(); }
  private stringArray(value: unknown) { return Array.isArray(value) ? [...new Set(value.map(String).map((x) => x.trim()).filter(Boolean))] : []; }
  private enumValue<T extends Record<string, string>>(enumeration: T, value: unknown, field: string): T[keyof T] {
    const normalized = String(value || '').toUpperCase();
    if (!Object.values(enumeration).includes(normalized)) throw new BadRequestException(`Invalid ${field}`);
    return normalized as T[keyof T];
  }
  private startOfToday() { const date = new Date(); date.setHours(0, 0, 0, 0); return date; }
}
