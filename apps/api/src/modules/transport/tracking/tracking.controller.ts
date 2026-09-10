import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('transport/tracking')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class TrackingController {
  constructor(private readonly service: TrackingService) {}

  @Post(':tripId/location')
  @Permissions('transport.gps.publish')
  updateLocation(
    @User('org') organizationId: string,
    @User('id') actorId: string,
    @Param('tripId') tripId: string,
    @Body() data: any,
  ) {
    return this.service.updateLocation(organizationId, tripId, data, actorId);
  }

  @Get(':tripId/latest')
  @Permissions('transport.gps.read')
  getLatest(@User('org') organizationId: string, @Param('tripId') tripId: string) {
    return this.service.getLatestLocation(organizationId, tripId);
  }

  @Get(':tripId/path')
  @Permissions('transport.gps.read')
  getPath(@User('org') organizationId: string, @Param('tripId') tripId: string) {
    return this.service.getTripPath(organizationId, tripId);
  }

  @Get('incidents/list')
  @Permissions('transport.safety.read')
  listIncidents(@User('org') organizationId: string, @Query('schoolId') schoolId: string, @Query('status') status?: string) {
    return this.service.listIncidents(organizationId, schoolId, status);
  }

  @Get('incidents/summary')
  @Permissions('transport.safety.read')
  summary(@User('org') organizationId: string, @Query('schoolId') schoolId: string) {
    return this.service.getSafetySummary(organizationId, schoolId);
  }

  @Post('incidents/:incidentId/resolve')
  @Permissions('transport.safety.manage')
  resolve(@User('org') organizationId: string, @User('id') actorId: string, @Param('incidentId') incidentId: string, @Body() data: any) {
    return this.service.resolveIncident(organizationId, incidentId, actorId, data?.resolution);
  }
}
