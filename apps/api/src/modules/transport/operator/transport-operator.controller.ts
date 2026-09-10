import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { TransportOperatorService } from './transport-operator.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';

@Controller('transport/operator')
@UseGuards(AuthGuard('jwt'))
export class TransportOperatorController {
  constructor(private readonly service: TransportOperatorService) {}

  @Get('profile')
  async getProfile(@User('id') userId: string) {
    return this.service.getOperatorProfile(userId);
  }

  @Get('dashboard')
  async getDashboard(@User('id') userId: string) {
    return this.service.getDashboard(userId);
  }

  @Get('trips/:id/manifest')
  async getManifest(@User('id') userId: string, @Param('id') tripId: string) {
    return this.service.getTripManifest(userId, tripId);
  }

  @Post('trips/:id/start')
  async startTrip(@User('id') userId: string, @Param('id') tripId: string) {
    return this.service.startTrip(userId, tripId);
  }

  @Post('trips/:id/boarding')
  async recordBoarding(@User('id') userId: string, @Param('id') tripId: string, @Body() data: any) {
    return this.service.recordBoarding(userId, tripId, data);
  }

  @Post('trips/:id/deboarding')
  async recordDeboarding(@User('id') userId: string, @Param('id') tripId: string, @Body() data: any) {
    return this.service.recordDeboarding(userId, tripId, data);
  }

  @Post('trips/:id/incident')
  async reportIncident(@User('id') userId: string, @Param('id') tripId: string, @Body() data: any) {
    return this.service.reportIncident(userId, tripId, data);
  }

  @Post('trips/:id/sos')
  async triggerSos(@User('id') userId: string, @Param('id') tripId: string, @Body() data: any) {
    return this.service.triggerSos(userId, tripId, data);
  }

  @Post('trips/:id/inspection')
  async recordInspection(@User('id') userId: string, @Param('id') tripId: string, @Body() data: any) {
    return this.service.recordInspection(userId, tripId, data);
  }

  @Post('trips/:id/complete')
  async completeTrip(@User('id') userId: string, @Param('id') tripId: string) {
    return this.service.completeTrip(userId, tripId);
  }

  @Post('trips/:id/location')
  async updateLocation(@User('id') userId: string, @Param('id') tripId: string, @Body() data: any) {
    return this.service.updateLocation(userId, tripId, data);
  }
}
