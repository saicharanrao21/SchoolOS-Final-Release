import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { User } from '../../auth/decorators/user.decorator';
import { StudentLifeService } from './student-life.service';

@Controller('student-life')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class StudentLifeController {
  constructor(private readonly service: StudentLifeService) {}
  @Get('dashboard') @Permissions('student_life.read') dashboard(@User('org') org: string, @Query('schoolId') school: string) { return this.service.dashboard(org, school); }
  @Get('behavior/incidents') @Permissions('student_life.read') incidents(@User('org') org: string, @Query('schoolId') school: string, @Query('status') status?: string) { return this.service.listIncidents(org, school, status); }
  @Post('behavior/incidents') @Permissions('student_life.manage') report(@User('org') org: string, @User('id') actor: string, @Body() body: any) { return this.service.reportIncident(org, body.schoolId, body.studentId, actor, body); }
  @Post('behavior/incidents/:id/actions') @Permissions('student_life.manage') action(@User('org') org: string, @User('id') actor: string, @Param('id') id: string, @Body() body: any) { return this.service.addAction(org, body.schoolId, id, actor, body); }
  @Patch('behavior/incidents/:id/status') @Permissions('student_life.manage') status(@User('org') org: string, @User('id') actor: string, @Param('id') id: string, @Body() body: any) { return this.service.updateIncident(org, body.schoolId, id, actor, body.status, body.resolution); }
  @Post('behavior/points') @Permissions('student_life.manage') points(@User('org') org: string, @User('id') actor: string, @Body() body: any) { return this.service.addPoints(org, body.schoolId, body.studentId, actor, Number(body.points), body.reason, body.incidentId); }
  @Post('counseling') @Permissions('student_life.manage') counseling(@User('org') org: string, @User('id') actor: string, @Body() body: any) { return this.service.createCounseling(org, body.schoolId, body.studentId, actor, body); }
}
