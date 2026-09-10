import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';
import { WorkflowStatus, WorkflowInstanceState, WorkflowStepType } from '@prisma/client';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class WorkflowService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async createDefinition(organizationId: string, data: any, actorId: string) {
    return this.db.workflowDefinition.create({
      data: {
        name: data.name,
        description: data.description,
        module: data.module,
        entityType: data.entityType,
        triggerEvent: data.triggerEvent,
        organizationId,
        schoolId: data.schoolId,
      },
    });
  }

  @OnEvent('**')
  async handleDomainEvent(payload: any) {
     // Generic event listener to trigger workflows based on mappings
     // This is a foundation for dynamic automation
  }

  async startWorkflow(organizationId: string, workflowId: string, entityId: string, actorId: string) {
    const version = await this.db.workflowVersion.findFirst({
      where: { workflowId, status: WorkflowStatus.PUBLISHED },
      orderBy: { versionNumber: 'desc' },
      include: { workflow: true, steps: { orderBy: { order: 'asc' } } },
    });

    if (!version) throw new NotFoundException('Active workflow version not found');

    const instance = await this.db.workflowInstance.create({
      data: {
        workflowId,
        versionId: version.id,
        entityId,
        entityType: version.workflow.entityType,
        organizationId,
        initiatedById: actorId,
        state: WorkflowInstanceState.IN_PROGRESS,
      },
    });

    // Initialize first step
    if (version.steps.length > 0) {
      await this.activateStep(instance.id, version.steps[0].id);
    }

    return instance;
  }

  private async activateStep(instanceId: string, stepId: string) {
    const step = await this.db.workflowStep.findUnique({ where: { id: stepId } });
    if (!step) return;

    await this.db.workflowStepInstance.create({
      data: {
        instanceId,
        stepId,
        status: WorkflowInstanceState.PENDING,
        startedAt: new Date(),
        // Assign to role/user logic here
      },
    });
  }

  async recordApproval(organizationId: string, stepInstanceId: string, data: any, actorId: string) {
    return this.db.$transaction(async (tx) => {
      const stepInstance = await tx.workflowStepInstance.findUnique({
        where: { id: stepInstanceId },
        include: { instance: true, step: { include: { version: { include: { steps: true } } } } },
      });

      if (!stepInstance || stepInstance.status !== WorkflowInstanceState.PENDING) {
        throw new BadRequestException('Invalid step or already processed');
      }

      const approval = await tx.workflowApproval.create({
        data: {
          stepInstanceId,
          approverId: actorId,
          decision: data.decision,
          comments: data.comments,
        },
      });

      if (data.decision === 'APPROVE') {
        await tx.workflowStepInstance.update({
          where: { id: stepInstanceId },
          data: { status: WorkflowInstanceState.APPROVED, completedAt: new Date() },
        });

        // Move to next step
        const currentOrder = stepInstance.step.order;
        const nextStep = stepInstance.step.version.steps.find((s: any) => s.order === currentOrder + 1);

        if (nextStep) {
          await this.activateStep(stepInstance.instanceId, nextStep.id);
        } else {
          // Workflow complete
          await tx.workflowInstance.update({
            where: { id: stepInstance.instanceId },
            data: { state: WorkflowInstanceState.APPROVED, completedAt: new Date() },
          });

          // Trigger domain update via event or direct service
        }
      } else if (data.decision === 'REJECT') {
        await tx.workflowStepInstance.update({
          where: { id: stepInstanceId },
          data: { status: WorkflowInstanceState.REJECTED, completedAt: new Date() },
        });

        await tx.workflowInstance.update({
          where: { id: stepInstance.instanceId },
          data: { state: WorkflowInstanceState.REJECTED, completedAt: new Date() },
        });
      }

      return approval;
    });
  }

  async getInbox(userId: string) {
    // In a real system, resolve assignments by role and delegation
    return this.db.workflowStepInstance.findMany({
      where: {
        status: WorkflowInstanceState.PENDING,
        // Mock filtering by user - in real app, join with roles/users
      },
      include: {
        instance: { include: { workflow: true, initiatedBy: true } },
        step: true,
      },
    });
  }
}
