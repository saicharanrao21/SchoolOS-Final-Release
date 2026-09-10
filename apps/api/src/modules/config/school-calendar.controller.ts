import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { PolicyGuard } from '../../auth/guards/policy.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { SchoolCalendarService } from './school-calendar.service';

@Controller('management/calendar')
@UseGuards(AuthGuard('jwt'), PermissionsGuard, PolicyGuard)
export class SchoolCalendarController {
  constructor(private readonly calendarService: SchoolCalendarService) {}

  @Get('events')
  @Permissions('academics.read')
  async getCalendarEvents(
    @Query('academicYearId') academicYearId: string,
    @Query('schoolId') schoolId?: string,
    @Query('campusId') campusId?: string,
  ) {
    return this.calendarService.getCalendarEvents(academicYearId, schoolId, campusId);
  }

  @Post('events')
  @Permissions('academics.manage')
  async createCalendarEvent(@Body() data: any) {
    return this.calendarService.createCalendarEvent(data);
  }
}
