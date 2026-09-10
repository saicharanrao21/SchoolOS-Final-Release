import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CommunicationThreadStatus } from '@prisma/client';

@Injectable()
export class CommunicationsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
    private readonly events: EventEmitter2,
  ) {}

  private async assertSchool(organizationId: string, schoolId: string) {
    const school = await this.db.school.findFirst({ where: { id: schoolId, organizationId }, select: { id: true } });
    if (!school) throw new NotFoundException('School not found in the current organization');
  }

  private async assertUsers(organizationId: string, schoolId: string, userIds: string[]) {
    const ids = [...new Set(userIds.filter(Boolean))];
    if (!ids.length) throw new BadRequestException('At least one participant is required');
    const users = await this.db.user.findMany({
      where: { id: { in: ids }, organizationId },
      select: { id: true, email: true, firstName: true, lastName: true },
    });
    if (users.length !== ids.length) throw new ForbiddenException('One or more participants do not belong to this organization');
    // Employees/guardians/students may belong to a school; staff without an explicit school relation remain valid org users.
    const studentCount = await this.db.student.count({ where: { schoolId, id: { in: ids } } }).catch(() => 0);
    void studentCount;
    return users;
  }

  async createThread(organizationId: string, actorId: string, data: { schoolId: string; subject: string; participantUserIds: string[]; studentId?: string }) {
    await this.assertSchool(organizationId, data.schoolId);
    if (!data.subject?.trim()) throw new BadRequestException('Subject is required');
    if (data.studentId) {
      const student = await this.db.student.findFirst({ where: { id: data.studentId, schoolId: data.schoolId }, select: { id: true } });
      if (!student) throw new NotFoundException('Student not found in the selected school');
    }
    const participantIds = [...new Set([actorId, ...(data.participantUserIds || [])])];
    await this.assertUsers(organizationId, data.schoolId, participantIds);

    const thread = await this.db.communicationThread.create({
      data: {
        organizationId, schoolId: data.schoolId, studentId: data.studentId || null, subject: data.subject.trim(), createdById: actorId,
        participants: { create: participantIds.map(userId => ({ userId })) },
      },
      include: { participants: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } } },
    });
    await this.audit.log({ action: 'communications.thread.create', resource: 'CommunicationThread', resourceId: thread.id, actorId, organizationId, schoolId: data.schoolId });
    this.events.emit('communications.thread.created', { organizationId, schoolId: data.schoolId, threadId: thread.id });
    return thread;
  }

  async listThreads(organizationId: string, schoolId: string, userId: string) {
    await this.assertSchool(organizationId, schoolId);
    return this.db.communicationThread.findMany({
      where: { organizationId, schoolId, participants: { some: { userId } } },
      include: {
        participants: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1, select: { id: true, body: true, senderId: true, createdAt: true } },
      },
      orderBy: { lastMessageAt: 'desc' },
      take: 100,
    });
  }

  async getThread(organizationId: string, schoolId: string, userId: string, threadId: string) {
    const thread = await this.db.communicationThread.findFirst({
      where: { id: threadId, organizationId, schoolId, participants: { some: { userId } } },
      include: {
        participants: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
        messages: { where: { deletedAt: null }, orderBy: { createdAt: 'asc' }, take: 500, include: { sender: { select: { id: true, firstName: true, lastName: true } } } },
      },
    });
    if (!thread) throw new NotFoundException('Conversation not found');
    return thread;
  }

  async sendMessage(organizationId: string, schoolId: string, userId: string, threadId: string, body: string, attachments?: unknown) {
    if (!body?.trim()) throw new BadRequestException('Message body is required');
    const thread = await this.db.communicationThread.findFirst({ where: { id: threadId, organizationId, schoolId, status: { not: CommunicationThreadStatus.ARCHIVED }, participants: { some: { userId } } }, select: { id: true, status: true } });
    if (!thread) throw new NotFoundException('Conversation not found or archived');
    const message = await this.db.communicationMessage.create({ data: { threadId, senderId: userId, body: body.trim(), attachments: attachments as any } });
    await this.db.communicationThread.update({ where: { id: threadId }, data: { lastMessageAt: message.createdAt, status: CommunicationThreadStatus.OPEN } });
    await this.audit.log({ action: 'communications.message.send', resource: 'CommunicationMessage', resourceId: message.id, actorId: userId, organizationId, schoolId, metadata: { threadId } });
    this.events.emit('communications.message.created', { organizationId, schoolId, threadId, messageId: message.id, senderId: userId });
    return message;
  }

  async markRead(organizationId: string, schoolId: string, userId: string, threadId: string) {
    const participant = await this.db.communicationThreadParticipant.findFirst({ where: { threadId, userId, thread: { organizationId, schoolId } } });
    if (!participant) throw new NotFoundException('Conversation participant not found');
    return this.db.communicationThreadParticipant.update({ where: { id: participant.id }, data: { lastReadAt: new Date() } });
  }

  async archive(organizationId: string, schoolId: string, userId: string, threadId: string) {
    const thread = await this.db.communicationThread.findFirst({ where: { id: threadId, organizationId, schoolId }, select: { id: true, createdById: true } });
    if (!thread) throw new NotFoundException('Conversation not found');
    if (thread.createdById !== userId) throw new ForbiddenException('Only the conversation creator can archive it');
    const result = await this.db.communicationThread.update({ where: { id: threadId }, data: { status: CommunicationThreadStatus.ARCHIVED } });
    await this.audit.log({ action: 'communications.thread.archive', resource: 'CommunicationThread', resourceId: threadId, actorId: userId, organizationId, schoolId });
    return result;
  }
}
