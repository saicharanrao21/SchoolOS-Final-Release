import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';
import { User } from '../../../auth/decorators/user.decorator';
import { SupportSessionsService } from './support-sessions.service';

@Controller('platform/support-sessions')
export class SupportSessionsController {
  constructor(private readonly service: SupportSessionsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('platform.support.impersonate')
  create(
    @User('id') actorUserId: string,
    @Body() body: {
      organizationId: string;
      targetUserId: string;
      reason: string;
      durationMinutes?: number;
    },
  ) {
    return this.service.createSession(
      body.organizationId,
      body.targetUserId,
      body.reason,
      actorUserId,
      body.durationMinutes,
    );
  }

  @Get('active')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('platform.support.impersonate')
  listActive(@User('id') actorUserId: string) {
    return this.service.listActiveSessions(actorUserId);
  }

  @Post('exchange')
  exchange(@Body('supportToken') supportToken: string) {
    return this.service.exchangeToken(supportToken);
  }

  @Post(':id/end')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('platform.support.impersonate')
  end(@Param('id') sessionId: string, @User('id') actorUserId: string) {
    return this.service.endSession(sessionId, actorUserId);
  }
}
