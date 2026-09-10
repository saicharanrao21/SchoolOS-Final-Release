import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';
import { User } from '../../../auth/decorators/user.decorator';
import { TimetableOperationsService } from './timetable-operations.service';

@Controller('academics/timetable-operations')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class TimetableOperationsController {
  constructor(private readonly service: TimetableOperationsService) {}

  @Post('validate-slot')
  @Permissions('timetable.update')
  validateSlot(@User('org') organizationId: string, @Body() data: any) {
    return this.service.validateSlot(organizationId, data);
  }

  @Get('versions/:versionId/readiness')
  @Permissions('timetable.update')
  readiness(@User('org') organizationId: string, @Param('versionId') versionId: string) {
    return this.service.publishReadiness(organizationId, versionId);
  }

  @Post('versions/:versionId/clone')
  @Permissions('timetable.create')
  clone(@User('org') organizationId: string, @Param('versionId') versionId: string, @User('id') actorId: string) {
    return this.service.cloneVersion(organizationId, versionId, actorId);
  }
}
