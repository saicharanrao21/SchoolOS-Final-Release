import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { User } from '../../auth/decorators/user.decorator';
import { StudentHealthService } from './student-health.service';

@Controller('health/students')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class StudentHealthController {
  constructor(private readonly service: StudentHealthService) {}

  @Get('dashboard')
  @Permissions('health.read')
  dashboard(@User('org') orgId: string, @Query('schoolId') schoolId: string) { return this.service.dashboard(orgId, schoolId); }

  @Get(':studentId/profile')
  @Permissions('health.read')
  profile(@User('org') orgId: string, @Query('schoolId') schoolId: string, @Param('studentId') studentId: string) { return this.service.getProfile(orgId, schoolId, studentId); }

  @Post(':studentId/profile')
  @Permissions('health.manage')
  upsertProfile(@User('org') orgId: string, @User('id') actorId: string, @Query('schoolId') schoolId: string, @Param('studentId') studentId: string, @Body() body: any) { return this.service.upsertProfile(orgId, schoolId, studentId, actorId, body); }

  @Get(':studentId/visits')
  @Permissions('health.read')
  visits(@User('org') orgId: string, @Query('schoolId') schoolId: string, @Param('studentId') studentId: string, @Query('from') from?: string, @Query('to') to?: string) { return this.service.listVisits(orgId, schoolId, studentId, from, to); }

  @Post(':studentId/visits')
  @Permissions('health.manage')
  recordVisit(@User('org') orgId: string, @User('id') actorId: string, @Query('schoolId') schoolId: string, @Param('studentId') studentId: string, @Body() body: any) { return this.service.recordVisit(orgId, schoolId, studentId, actorId, body); }

  @Get(':studentId/medications')
  @Permissions('health.read')
  medications(@User('org') orgId: string, @Query('schoolId') schoolId: string, @Param('studentId') studentId: string, @Query('activeOnly') activeOnly?: string) { return this.service.listMedications(orgId, schoolId, studentId, activeOnly === 'true'); }

  @Post(':studentId/medications')
  @Permissions('health.manage')
  addMedication(@User('org') orgId: string, @User('id') actorId: string, @Query('schoolId') schoolId: string, @Param('studentId') studentId: string, @Body() body: any) { return this.service.addMedication(orgId, schoolId, studentId, actorId, body); }

  @Patch('medications/:id')
  @Permissions('health.manage')
  updateMedication(@User('org') orgId: string, @User('id') actorId: string, @Query('schoolId') schoolId: string, @Param('id') id: string, @Body() body: any) { return this.service.updateMedication(orgId, schoolId, id, actorId, body); }
}
