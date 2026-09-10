import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class StudentLifeService {
  constructor(private readonly db: DatabaseService, private readonly audit: AuditService, private readonly events: EventEmitter2) {}
  private async assertStudent(organizationId: string, schoolId: string, studentId: string) {
    const student = await this.db.student.findFirst({ where: { id: studentId, schoolId, school: { organizationId }, isActive: true } });
    if (!student) throw new NotFoundException('Student not found in this school');
    return student;
  }
  private async assertSchool(organizationId: string, schoolId: string) {
    const school = await this.db.school.findFirst({ where: { id: schoolId, organizationId, isActive: true }, select: { id: true } });
    if (!school) throw new NotFoundException('School not found in this organization');
  }
  async dashboard(organizationId: string, schoolId: string) {
    await this.assertSchool(organizationId, schoolId);
    const [openIncidents, actionsDue, positivePoints, counselingOpen, recent] = await Promise.all([
      this.db.behaviorIncident.count({ where: { schoolId, organizationId, status: { in: ['OPEN', 'UNDER_REVIEW'] } } }),
      this.db.behaviorAction.count({ where: { schoolId, organizationId, status: { in: ['PENDING', 'IN_PROGRESS'] }, dueDate: { not: null } } }),
      this.db.behaviorPointLedger.aggregate({ where: { schoolId, organizationId, points: { gt: 0 } }, _sum: { points: true } }),
      this.db.studentCounselingSession.count({ where: { schoolId, organizationId, status: { in: ['OPEN', 'FOLLOW_UP'] } } }),
      this.db.behaviorIncident.findMany({ where: { schoolId, organizationId }, orderBy: { occurredAt: 'desc' }, take: 10, include: { student: { select: { id: true, admissionNumber: true, firstName: true, lastName: true } } } }),
    ]);
    return { openIncidents, actionsDue, positivePoints: Number(positivePoints._sum.points || 0), counselingOpen, recent };
  }
  async listIncidents(organizationId: string, schoolId: string, status?: string) {
    await this.assertSchool(organizationId, schoolId);
    return this.db.behaviorIncident.findMany({ where: { organizationId, schoolId, ...(status ? { status } : {}) }, orderBy: { occurredAt: 'desc' }, include: { student: { select: { id: true, admissionNumber: true, firstName: true, lastName: true } }, actions: true } });
  }
  async reportIncident(organizationId: string, schoolId: string, studentId: string, actorId: string, data: any) {
    await this.assertStudent(organizationId, schoolId, studentId);
    if (!data.title?.trim() || !data.description?.trim()) throw new BadRequestException('Title and description are required');
    const incident = await this.db.behaviorIncident.create({ data: { organizationId, schoolId, studentId, reportedById: actorId, title: data.title.trim(), description: data.description.trim(), category: data.category || 'GENERAL', severity: data.severity || 'MEDIUM', occurredAt: new Date(data.occurredAt || Date.now()), location: data.location, witnesses: data.witnesses, status: 'OPEN' } });
    await this.audit.log({ action: 'student_life.behavior_incident.reported', resource: 'BehaviorIncident', resourceId: incident.id, actorId, organizationId, metadata: { schoolId, studentId, severity: incident.severity } });
    this.events.emit('student.behavior.incident_reported', { organizationId, schoolId, studentId, incidentId: incident.id, severity: incident.severity });
    return incident;
  }
  async addAction(organizationId: string, schoolId: string, incidentId: string, actorId: string, data: any) {
    const incident = await this.db.behaviorIncident.findFirst({ where: { id: incidentId, organizationId, schoolId } });
    if (!incident) throw new NotFoundException('Behavior incident not found');
    if (!data.type?.trim()) throw new BadRequestException('Action type is required');
    const action = await this.db.behaviorAction.create({ data: { incidentId, schoolId, organizationId, assignedToId: data.assignedToId, type: data.type.trim(), notes: data.notes, dueDate: data.dueDate ? new Date(data.dueDate) : null, status: 'PENDING' } });
    await this.audit.log({ action: 'student_life.behavior_action.created', resource: 'BehaviorAction', resourceId: action.id, actorId, organizationId, metadata: { incidentId, schoolId } });
    return action;
  }
  async updateIncident(organizationId: string, schoolId: string, incidentId: string, actorId: string, status: string, resolution?: string) {
    const incident = await this.db.behaviorIncident.findFirst({ where: { id: incidentId, organizationId, schoolId } });
    if (!incident) throw new NotFoundException('Behavior incident not found');
    if (!['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'].includes(status)) throw new BadRequestException('Invalid incident status');
    const updated = await this.db.behaviorIncident.update({ where: { id: incidentId }, data: { status, resolution: resolution || incident.resolution, resolvedAt: ['RESOLVED', 'CLOSED'].includes(status) ? new Date() : null } });
    await this.audit.log({ action: 'student_life.behavior_incident.status_changed', resource: 'BehaviorIncident', resourceId: incidentId, actorId, organizationId, metadata: { schoolId, status } });
    return updated;
  }
  async addPoints(organizationId: string, schoolId: string, studentId: string, actorId: string, points: number, reason: string, incidentId?: string) {
    await this.assertStudent(organizationId, schoolId, studentId);
    if (!Number.isInteger(points) || points === 0) throw new BadRequestException('Points must be a non-zero integer');
    if (!reason?.trim()) throw new BadRequestException('A reason is required');
    const entry = await this.db.behaviorPointLedger.create({ data: { organizationId, schoolId, studentId, incidentId, points, reason: reason.trim(), awardedById: actorId } });
    await this.audit.log({ action: 'student_life.behavior_points.recorded', resource: 'BehaviorPointLedger', resourceId: entry.id, actorId, organizationId, metadata: { schoolId, studentId, points } });
    return entry;
  }
  async createCounseling(organizationId: string, schoolId: string, studentId: string, actorId: string, data: any) {
    await this.assertStudent(organizationId, schoolId, studentId);
    if (!data.summary?.trim()) throw new BadRequestException('Counseling summary is required');
    const session = await this.db.studentCounselingSession.create({ data: { organizationId, schoolId, studentId, counselorId: actorId, sessionDate: new Date(data.sessionDate || Date.now()), type: data.type || 'GENERAL', summary: data.summary.trim(), actionPlan: data.actionPlan, nextFollowUpAt: data.nextFollowUpAt ? new Date(data.nextFollowUpAt) : null, guardianNotified: Boolean(data.guardianNotified), status: data.nextFollowUpAt ? 'FOLLOW_UP' : 'CLOSED' } });
    await this.audit.log({ action: 'student_life.counseling.created', resource: 'StudentCounselingSession', resourceId: session.id, actorId, organizationId, metadata: { schoolId, studentId } });
    return session;
  }
}
