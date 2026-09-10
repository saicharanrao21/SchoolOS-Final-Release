import { Controller, Get, Post, Body, Param, Patch, UseGuards, Query } from '@nestjs/common';
import { PtmService } from './ptm.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('ptm')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class PtmController {
  constructor(private readonly service: PtmService) {}

  @Post('events')
  @Permissions('ptm.manage')
  async createEvent(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.createPtmEvent(organizationId, data, actorId);
  }

  @Post('slots/bulk')
  @Permissions('ptm.slots.manage')
  async createSlots(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.createSlots(organizationId, data, actorId);
  }

  @Post('slots/:id/book')
  async bookSlot(@User('org') organizationId: string, @User('id') userId: string, @Param('id') slotId: string, @Body() data: any) {
    return this.service.bookSlot(organizationId, userId, slotId, data);
  }

  @Get('dashboard')
  @Permissions('ptm.read')
  async getDashboard(@User('org') organizationId: string, @Query('schoolId') schoolId: string) {
    return this.service.getDashboard(organizationId, schoolId);
  }

  @Get('slots/available')
  async findAvailable(@User('org') organizationId: string, @Query('eventId') eventId: string, @Query('teacherId') teacherId?: string) {
    return this.service.findAvailableSlots(organizationId, eventId, teacherId);
  }

  @Get('my-meetings')
  async getMyMeetings(@User('org') organizationId: string, @User('id') userId: string, @User('role') role: string) {
    if (role === 'TEACHER') {
      return this.service.getTeacherMeetings(organizationId, userId);
    }
    return this.service.getGuardianMeetings(organizationId, userId);
  }
}
