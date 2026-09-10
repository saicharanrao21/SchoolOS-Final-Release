import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class AiAssistantService {
  private readonly logger = new Logger(AiAssistantService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  // --- Knowledge Base Management ---

  async createKnowledgeItem(organizationId: string, schoolId: string, data: any, actorId: string) {
    const item = await this.db.aiKnowledgeBase.create({
      data: {
        organizationId,
        schoolId,
        title: data.title,
        content: data.content,
        category: data.category || 'GENERAL',
        targetRole: data.targetRole || 'ALL',
      },
    });

    await this.audit.log({
      action: 'ai.knowledge.create',
      resource: 'AiKnowledgeBase',
      resourceId: item.id,
      actorId,
      organizationId,
      schoolId,
    });

    return item;
  }

  async getKnowledgeItems(organizationId: string, schoolId: string) {
    return this.db.aiKnowledgeBase.findMany({
      where: { schoolId, school: { organizationId }, isActive: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  // --- Data-Grounded Query Execution ---

  async queryAssistant(
    organizationId: string,
    schoolId: string,
    userId: string,
    userRole: string,
    queryText: string,
  ) {
    if (!queryText || !queryText.trim()) {
      throw new BadRequestException('Query text is required');
    }

    // 1. Context Retrieval (Role-Aware & Scope-Enforced)
    const context = await this.buildRoleContext(organizationId, schoolId, userId, userRole);
    const knowledgeBase = await this.getRelevantKnowledge(schoolId, queryText, userRole);

    // 2. Generate Grounded Answer
    const answer = this.generateGroundedAnswer(queryText, userRole, context, knowledgeBase);

    // 3. Log AI Usage & Audit
    await this.db.aiUsageLog.create({
      data: {
        organizationId,
        schoolId,
        userId,
        role: userRole,
        query: queryText,
        tokensUsed: Math.ceil((queryText.length + JSON.stringify(answer).length) / 4),
        provider: process.env.GEMINI_API_KEY ? 'GEMINI' : 'RULE_ENGINE',
        model: 'gemini-1.5-flash',
      },
    });

    return {
      query: queryText,
      answer: answer.text,
      groundedSources: answer.sources,
      timestamp: new Date(),
    };
  }

  private async buildRoleContext(organizationId: string, schoolId: string, userId: string, role: string) {
    if (role === 'STUDENT') {
      const student = await this.db.student.findFirst({
        where: { userId, schoolId },
        include: { feeAccount: true },
      });
      if (!student) return null;

      const [recentAttendance, reportCards] = await Promise.all([
        this.db.studentAttendanceRecord.findMany({
          where: { studentId: student.id },
          take: 10,
          orderBy: { createdAt: 'desc' },
        }),
        this.db.reportCard.findMany({
          where: { studentId: student.id },
          take: 3,
        }),
      ]);

      return { type: 'STUDENT', student, recentAttendance, reportCards };
    }

    if (role === 'PARENT') {
      const guardian = await this.db.guardian.findFirst({ where: { userId } });
      if (!guardian) return null;

      const children = await this.db.guardianStudent.findMany({
        where: { guardianId: guardian.id },
        include: { student: { include: { feeAccount: true } } },
      });

      return { type: 'PARENT', children: children.map((c) => c.student) };
    }

    if (role === 'TEACHER') {
      const employee = await this.db.employee.findFirst({ where: { userId, schoolId } });
      if (!employee) return null;

      const assignments = await this.db.teacherSubjectAssignment.findMany({
        where: { employeeId: employee.id, status: 'ACTIVE' },
        include: { class: true, subject: true },
      });

      return { type: 'TEACHER', employee, assignments };
    }

    // Default ADMIN/PRINCIPAL context
    const [studentCount, employeeCount, activeInvoices] = await Promise.all([
      this.db.student.count({ where: { schoolId, status: 'ACTIVE' } }),
      this.db.employee.count({ where: { schoolId, isActive: true } }),
      this.db.feeDemand.count({ where: { student: { schoolId }, status: { in: ['ISSUED', 'PARTIALLY_PAID'] } } }),
    ]);

    return { type: 'ADMIN', studentCount, employeeCount, activeInvoices };
  }

  private async getRelevantKnowledge(schoolId: string, query: string, role: string) {
    return this.db.aiKnowledgeBase.findMany({
      where: {
        schoolId,
        isActive: true,
        OR: [{ targetRole: 'ALL' }, { targetRole: role }],
      },
      take: 5,
    });
  }

  private generateGroundedAnswer(query: string, role: string, context: any, knowledge: any[]) {
    const q = query.toLowerCase();
    const sources: string[] = [];

    if (knowledge.length) {
      sources.push(...knowledge.map((k) => `KnowledgeBase: ${k.title}`));
    }

    if (q.includes('fee') || q.includes('balance') || q.includes('payment') || q.includes('due')) {
      if (context?.type === 'STUDENT' && context.student?.feeAccount) {
        sources.push('StudentFeeAccount');
        const acc = context.student.feeAccount;
        return {
          text: `Your current fee account status: Total Charged: ${acc.totalDemanded || 0}, Total Paid: ${acc.totalPaid || 0}, Current Outstanding Balance: ${acc.balance || 0}.`,
          sources,
        };
      }
      if (context?.type === 'PARENT' && context.children?.length) {
        sources.push('ParentChildrenFeeAccount');
        const feeSummaries = context.children.map((c: any) => `${c.firstName}: Outstanding Balance ${c.feeAccount?.balance || 0}`).join('; ');
        return {
          text: `Here is the fee status for your children: ${feeSummaries}.`,
          sources,
        };
      }
    }

    if (q.includes('attendance') || q.includes('absent') || q.includes('present')) {
      if (context?.type === 'STUDENT' && context.recentAttendance) {
        sources.push('StudentAttendanceRecords');
        const presentCount = context.recentAttendance.filter((a: any) => a.status === 'PRESENT').length;
        const total = context.recentAttendance.length;
        return {
          text: `In your recent ${total} attendance records, you were marked Present ${presentCount} times.`,
          sources,
        };
      }
    }

    if (q.includes('class') || q.includes('subject') || q.includes('teach')) {
      if (context?.type === 'TEACHER' && context.assignments) {
        sources.push('TeacherSubjectAssignments');
        const classList = context.assignments.map((a: any) => `${a.subject?.name} for ${a.class?.name}`).join(', ');
        return {
          text: `You are assigned to teach: ${classList || 'No active classes assigned'}.`,
          sources,
        };
      }
    }

    // Knowledge base matching
    const matchedKb = knowledge.find((k) => q.includes(k.title.toLowerCase()) || k.content.toLowerCase().includes(q));
    if (matchedKb) {
      return { text: matchedKb.content, sources: [`KnowledgeBase: ${matchedKb.title}`] };
    }

    if (context?.type === 'ADMIN') {
      sources.push('SchoolOverviewData');
      return {
        text: `SchoolOS Overview: Active Students: ${context.studentCount}, Active Staff: ${context.employeeCount}, Pending Invoices: ${context.activeInvoices}.`,
        sources,
      };
    }

    return {
      text: `SchoolOS Assistant: How can I assist you with your ${role.toLowerCase()} portal activities today?`,
      sources,
    };
  }
}
