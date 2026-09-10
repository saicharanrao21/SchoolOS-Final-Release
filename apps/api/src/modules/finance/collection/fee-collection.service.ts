import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma, FeeLateFeeType, FeeReminderChannel, FeeReminderStatus, InvoiceStatus } from '@prisma/client';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';

@Injectable()
export class FeeCollectionService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
    private readonly events: EventEmitter2,
  ) {}

  private async school(organizationId: string, schoolId: string) {
    const school = await this.db.school.findFirst({ where: { id: schoolId, organizationId } });
    if (!school) throw new NotFoundException('School not found');
    return school;
  }

  async createLateFeeRule(organizationId: string, schoolId: string, data: any, actorId: string) {
    await this.school(organizationId, schoolId);
    const value = new Prisma.Decimal(data.value);
    if (value.lte(0)) throw new BadRequestException('Late fee value must be positive');
    const graceDays = Number(data.graceDays ?? 0);
    if (!Number.isInteger(graceDays) || graceDays < 0 || graceDays > 365) {
      throw new BadRequestException('Grace days must be between 0 and 365');
    }
    if (!Object.values(FeeLateFeeType).includes(data.type)) {
      throw new BadRequestException('Invalid late fee type');
    }
    if (data.type === FeeLateFeeType.PERCENTAGE && value.gt(100)) {
      throw new BadRequestException('Percentage cannot exceed 100');
    }
    const rule = await this.db.feeLateFeeRule.create({
      data: {
        schoolId,
        name: String(data.name).trim(),
        type: data.type,
        value,
        graceDays,
        maxAmount: data.maxAmount == null ? undefined : new Prisma.Decimal(data.maxAmount),
        isActive: data.isActive !== false,
      },
    });
    await this.audit.log({ action: 'fee.late_fee_rule.create', resource: 'FeeLateFeeRule', resourceId: rule.id, actorId, organizationId, schoolId, metadata: { name: rule.name, type: rule.type } });
    return rule;
  }

  async listLateFeeRules(organizationId: string, schoolId: string) {
    await this.school(organizationId, schoolId);
    return this.db.feeLateFeeRule.findMany({ where: { schoolId }, orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }] });
  }

  async processOverdues(organizationId: string, schoolId: string, asOf = new Date(), actorId?: string) {
    await this.school(organizationId, schoolId);
    const rules = await this.db.feeLateFeeRule.findMany({ where: { schoolId, isActive: true }, orderBy: { graceDays: 'asc' } });
    const demands = await this.db.feeDemand.findMany({
      where: { student: { schoolId, school: { organizationId } }, status: { in: [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID] }, dueDate: { lt: asOf } },
      include: { student: true },
    });
    let processed = 0;
    let lateFeesAdded = new Prisma.Decimal(0);
    for (const demand of demands) {
      const rule = rules.find(r => asOf.getTime() >= new Date(demand.dueDate).getTime() + r.graceDays * 86400000);
      if (!rule) continue;
      const base = demand.balanceAmount;
      if (base.lte(0)) continue;
      let fee = rule.type === FeeLateFeeType.FIXED ? rule.value : rule.type === FeeLateFeeType.DAILY_FIXED
        ? rule.value.mul(Math.max(1, Math.floor((asOf.getTime() - new Date(demand.dueDate).getTime()) / 86400000) - rule.graceDays))
        : base.mul(rule.value).div(100);
      if (rule.maxAmount && fee.gt(rule.maxAmount)) fee = rule.maxAmount;
      const already = demand.lateFeeAmount;
      if (fee.lte(already)) {
        if (demand.status !== InvoiceStatus.OVERDUE) await this.db.feeDemand.update({ where: { id: demand.id }, data: { status: InvoiceStatus.OVERDUE } });
        continue;
      }
      const additional = fee.sub(already);
      await this.db.$transaction(async tx => {
        await tx.feeDemand.update({ where: { id: demand.id }, data: { status: InvoiceStatus.OVERDUE, lateFeeAmount: fee, totalAmount: { increment: additional }, balanceAmount: { increment: additional }, lateFeeRuleId: rule.id, lateFeeAppliedAt: asOf } });
        await tx.studentFeeAccount.update({ where: { studentId: demand.studentId }, data: { balance: { increment: additional } } });
        await tx.financialLedgerEntry.create({ data: { type: 'LATE_FEE', amount: additional, studentId: demand.studentId, organizationId, schoolId, description: `Late fee applied to ${demand.invoiceNumber}` } });
      });
      processed++;
      lateFeesAdded = lateFeesAdded.add(additional);
      this.events.emit('finance.fee.late_fee_applied', { organizationId, schoolId, studentId: demand.studentId, feeDemandId: demand.id, invoiceNumber: demand.invoiceNumber, amount: additional.toNumber() });
      if (actorId) await this.audit.log({ action: 'fee.late_fee.apply', resource: 'FeeDemand', resourceId: demand.id, actorId, organizationId, schoolId, metadata: { invoiceNumber: demand.invoiceNumber, amount: additional.toNumber(), ruleId: rule.id } });
    }
    return { processed, lateFeesAdded: lateFeesAdded.toNumber(), asOf };
  }

  async agingSummary(organizationId: string, schoolId: string, asOf = new Date()) {
    await this.school(organizationId, schoolId);
    const demands = await this.db.feeDemand.findMany({
      where: { student: { schoolId, school: { organizationId } }, balanceAmount: { gt: 0 }, status: { notIn: [InvoiceStatus.CANCELLED, InvoiceStatus.VOID] } },
      select: { balanceAmount: true, dueDate: true, status: true },
    });
    const buckets = { current: 0, days1to30: 0, days31to60: 0, days61to90: 0, days90plus: 0 };
    for (const d of demands) {
      const days = Math.max(0, Math.floor((asOf.getTime() - new Date(d.dueDate).getTime()) / 86400000));
      const amount = d.balanceAmount.toNumber();
      if (days === 0) buckets.current += amount;
      else if (days <= 30) buckets.days1to30 += amount;
      else if (days <= 60) buckets.days31to60 += amount;
      else if (days <= 90) buckets.days61to90 += amount;
      else buckets.days90plus += amount;
    }
    return { schoolId, asOf, outstanding: Object.values(buckets).reduce((a, b) => a + b, 0), buckets };
  }

  async queueReminders(organizationId: string, schoolId: string, data: any, actorId: string) {
    await this.school(organizationId, schoolId);
    const channel = data.channel as FeeReminderChannel;
    if (!Object.values(FeeReminderChannel).includes(channel)) throw new BadRequestException('Invalid reminder channel');
    const daysAhead = Math.max(0, Math.min(30, Number(data.daysAhead ?? 3)));
    const now = new Date();
    const cutoff = new Date(now.getTime() + daysAhead * 86400000);
    const demands = await this.db.feeDemand.findMany({ where: { student: { schoolId, school: { organizationId } }, balanceAmount: { gt: 0 }, dueDate: { lte: cutoff }, status: { in: [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE] } }, include: { student: { include: { guardians: { include: { guardian: true } } } } } });
    let queued = 0;
    const reminderDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    for (const demand of demands) {
      const guardian = demand.student.guardians.find(g => g.isPrimary) ?? demand.student.guardians[0];
      const recipient = channel === FeeReminderChannel.PUSH ? guardian?.guardian.userId : channel === FeeReminderChannel.EMAIL ? guardian?.guardian.email : guardian?.guardian.phone;
      if (!recipient) continue;
      const reminder = await this.db.feeReminder.upsert({
        where: { feeDemandId_channel_reminderDate: { feeDemandId: demand.id, channel, reminderDate } },
        update: { recipient, status: FeeReminderStatus.QUEUED },
        create: { feeDemandId: demand.id, channel, reminderDate, recipient, message: `Fee due for ${demand.student.firstName} ${demand.student.lastName}: ${demand.invoiceNumber}. Outstanding ₹${demand.balanceAmount.toFixed(2)}.` },
      });
      this.events.emit('finance.fee.reminder.requested', { organizationId, schoolId, feeDemandId: demand.id, reminderId: reminder.id, channel, recipient, amount: demand.balanceAmount.toNumber() });
      queued++;
    }
    await this.audit.log({ action: 'fee.reminders.queue', resource: 'FeeReminder', resourceId: schoolId, actorId, organizationId, schoolId, metadata: { channel, queued, daysAhead } });
    return { queued, channel, daysAhead };
  }

  async listReminders(organizationId: string, schoolId: string, status?: FeeReminderStatus) {
    await this.school(organizationId, schoolId);
    return this.db.feeReminder.findMany({ where: { status, feeDemand: { student: { schoolId, school: { organizationId } } } }, include: { feeDemand: { include: { student: true } } }, orderBy: { createdAt: 'desc' }, take: 200 });
  }
}
