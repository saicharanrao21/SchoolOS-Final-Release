import { Controller, Get, Post, Body, Param, Patch, UseGuards, Query } from '@nestjs/common';
import { TripsService } from './trips.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('transport/trips')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class TripsController {
  constructor(private readonly service: TripsService) {}

  @Post()
  @Permissions('trip.manage')
  create(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.createTrip(organizationId, data, actorId);
  }

  @Patch(':id/start')
  @Permissions('trip.start')
  start(@User('org') organizationId: string, @Param('id') id: string, @User('id') actorId: string) {
    return this.service.startTrip(organizationId, id, actorId);
  }

  @Post(':id/board')
  @Permissions('transport.board')
  board(@User('org') organizationId: string, @Param('id') id: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.boardStudent(organizationId, id, data, actorId);
  }

  @Post(':id/deboard')
  @Permissions('transport.deboard')
  deboard(@User('org') organizationId: string, @Param('id') id: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.deboardStudent(organizationId, id, data, actorId);
  }

  @Patch(':id/complete')
  @Permissions('trip.manage')
  complete(@User('org') organizationId: string, @Param('id') id: string, @User('id') actorId: string) {
    return this.service.completeTrip(organizationId, id, actorId);
  }

  @Get('active')
  @Permissions('transport.read')
  findActive(@User('org') organizationId: string, @Query('schoolId') schoolId: string) {
    return this.service.findActiveTrips(organizationId, schoolId);
  }
}
