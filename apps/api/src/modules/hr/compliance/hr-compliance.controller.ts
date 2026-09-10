import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';
import { HrComplianceService } from './hr-compliance.service';

@Controller('hr/compliance')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class HrComplianceController {
  constructor(private readonly service: HrComplianceService) {}

  @Get('summary') @Permissions('hr.compliance.read')
  summary(@User('org') org: string, @Query('schoolId') schoolId: string) { return this.service.getHrComplianceSummary(org, schoolId); }
  @Get('documents') @Permissions('hr.compliance.read')
  documents(@User('org') org: string, @Query('schoolId') schoolId: string, @Query('employeeId') employeeId?: string) { return this.service.listDocuments(org, schoolId, employeeId); }
  @Get('documents/expiring') @Permissions('hr.compliance.read')
  expiring(@User('org') org: string, @Query('schoolId') schoolId: string, @Query('days') days?: string) { return this.service.listExpiringDocuments(org, schoolId, Number(days || 30)); }
  @Post('documents') @Permissions('hr.compliance.manage')
  createDocument(@User('org') org: string, @Body() data: any, @User('id') actor: string) { return this.service.createDocument(org, data, actor); }
  @Patch('documents/:id/verify') @Permissions('hr.compliance.manage')
  verify(@User('org') org: string, @Param('id') id: string, @User('id') actor: string) { return this.service.verifyDocument(org, id, actor); }
  @Get('reviews') @Permissions('hr.performance.read')
  reviews(@User('org') org: string, @Query('schoolId') schoolId: string, @Query('employeeId') employeeId?: string) { return this.service.listReviews(org, schoolId, employeeId); }
  @Post('reviews') @Permissions('hr.performance.manage')
  createReview(@User('org') org: string, @Body() data: any, @User('id') actor: string) { return this.service.createReview(org, data, actor); }
  @Patch('reviews/:id') @Permissions('hr.performance.manage')
  updateReview(@User('org') org: string, @Param('id') id: string, @Body() data: any, @User('id') actor: string) { return this.service.updateReview(org, id, data, actor); }
  @Get('training') @Permissions('hr.training.read')
  training(@User('org') org: string, @Query('schoolId') schoolId: string, @Query('employeeId') employeeId?: string) { return this.service.listTrainings(org, schoolId, employeeId); }
  @Post('training') @Permissions('hr.training.manage')
  createTraining(@User('org') org: string, @Body() data: any, @User('id') actor: string) { return this.service.createTraining(org, data, actor); }
}
