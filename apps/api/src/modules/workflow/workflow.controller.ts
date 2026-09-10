import { Controller, Get, Post, Body, Param, Patch, UseGuards, Query } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('workflow')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class WorkflowController {
  constructor(private readonly service: WorkflowService) {}

  @Post('definitions')
  @Permissions('workflows.manage')
  async createDefinition(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.createDefinition(organizationId, data, actorId);
  }

  @Get('inbox')
  async getInbox(@User('id') userId: string) {
    return this.service.getInbox(userId);
  }

  @Post('steps/:id/approve')
  @Permissions('workflows.approve')
  async approve(@User('org') organizationId: string, @Param('id') stepInstanceId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.recordApproval(organizationId, stepInstanceId, data, actorId);
  }

  @Post('start')
  async start(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.startWorkflow(organizationId, data.workflowId, data.entityId, actorId);
  }
}
