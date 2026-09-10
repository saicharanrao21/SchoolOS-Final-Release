import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { User } from '../../auth/decorators/user.decorator';
import { AiAssistantService } from './ai.service';

@Controller('ai')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class AiAssistantController {
  constructor(private readonly service: AiAssistantService) {}

  @Post('query')
  async queryAssistant(
    @User('org') organizationId: string,
    @Query('schoolId') schoolId: string,
    @User('id') userId: string,
    @User('role') role: string,
    @Body('query') query: string,
  ) {
    return this.service.queryAssistant(organizationId, schoolId, userId, role, query);
  }

  @Get('knowledge-base')
  async getKnowledgeItems(
    @User('org') organizationId: string,
    @Query('schoolId') schoolId: string,
  ) {
    return this.service.getKnowledgeItems(organizationId, schoolId);
  }

  @Post('knowledge-base')
  @Permissions('settings.manage')
  async createKnowledgeItem(
    @User('org') organizationId: string,
    @Query('schoolId') schoolId: string,
    @Body() data: any,
    @User('id') actorId: string,
  ) {
    return this.service.createKnowledgeItem(organizationId, schoolId, data, actorId);
  }
}
