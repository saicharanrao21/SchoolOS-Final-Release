import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';
import { User } from '../../../auth/decorators/user.decorator';
import { AuditSeverity } from '@prisma/client';
import { PlatformAuditService } from './platform-audit.service';

@Controller('platform/audit')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class PlatformAuditController {
  constructor(private readonly service: PlatformAuditService) {}

  @Get('summary')
  @Permissions('platform.audit.read')
  summary(@User('org') organizationId: string) {
    return this.service.summary(organizationId);
  }

  @Get()
  @Permissions('platform.audit.read')
  search(
    @User('org') organizationId: string,
    @Query('schoolId') schoolId?: string,
    @Query('action') action?: string,
    @Query('resource') resource?: string,
    @Query('severity') severity?: AuditSeverity,
    @Query('actorId') actorId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.service.search(organizationId, { schoolId, action, resource, severity, actorId, from, to, page: Number(page || 1), pageSize: Number(pageSize || 25) });
  }
}
