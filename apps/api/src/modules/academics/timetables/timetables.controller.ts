import { Controller, Get, Post, Body, Param, Patch, UseGuards, Query } from '@nestjs/common';
import { TimetablesService } from './timetables.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('academics/timetables')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class TimetablesController {
  constructor(private readonly service: TimetablesService) {}

  @Post('periods')
  @Permissions('timetable.create')
  createPeriod(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.createPeriod(organizationId, data, actorId);
  }

  @Get('periods')
  @Permissions('timetable.read')
  getPeriods(@User('org') organizationId: string, @Query('schoolId') schoolId: string, @Query('campusId') campusId?: string) {
    return this.service.getPeriods(organizationId, schoolId, campusId);
  }

  @Post()
  @Permissions('timetable.create')
  createTimetable(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.createTimetable(organizationId, data, actorId);
  }

  @Patch('versions/:versionId/save')
  @Permissions('timetable.update')
  saveDraft(@User('org') organizationId: string, @Param('versionId') versionId: string, @Body('entries') entries: any[], @User('id') actorId: string) {
    return this.service.saveDraft(organizationId, versionId, entries, actorId);
  }

  @Get('versions/:versionId/validate')
  @Permissions('timetable.update')
  validate(@User('org') organizationId: string, @Param('versionId') versionId: string) {
    return this.service.validateTimetable(organizationId, versionId);
  }

  @Patch('versions/:versionId/publish')
  @Permissions('timetable.publish')
  publish(@User('org') organizationId: string, @Param('versionId') versionId: string, @User('id') actorId: string) {
    return this.service.publish(organizationId, versionId, actorId);
  }

  @Get('published')
  @Permissions('timetable.read')
  getPublished(@Query('classId') classId: string, @Query('sectionId') sectionId: string) {
    return this.service.getPublishedTimetable(classId, sectionId);
  }
}
