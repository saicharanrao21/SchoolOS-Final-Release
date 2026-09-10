import { Controller, Get, Post, Body, Param, Patch, UseGuards, Query } from '@nestjs/common';
import { HostelService } from './hostel.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('hostel')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class HostelController {
  constructor(private readonly service: HostelService) {}

  @Post()
  @Permissions('hostel.manage')
  createHostel(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) { return this.service.createHostel(organizationId, data, actorId); }

  @Post('allocate')
  @Permissions('hostel.allocate')
  allocateBed(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) { return this.service.allocateBed(organizationId, data, actorId); }

  @Post('outpass')
  requestOutpass(@User('id') userId: string, @Body() data: any) { return this.service.requestOutpass(userId, data); }

  @Get('dashboard')
  @Permissions('hostel.read')
  getDashboard(@User('org') organizationId: string, @Query('schoolId') schoolId: string) { return this.service.getDashboard(organizationId, schoolId); }

  @Get('hostels')
  @Permissions('hostel.read')
  findAll(@User('org') organizationId: string, @Query('schoolId') schoolId: string) { return this.service.findAllHostels(organizationId, schoolId); }

  @Get('my-hostel')
  getMyHostel(@User('id') userId: string) { return this.service.getStudentHostelInfo(userId); }

  @Post('inspections')
  @Permissions('hostel.incidents.manage')
  createInspection(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) { return this.service.createInspection(organizationId, data, actorId); }

  @Patch('inspections/:id/complete')
  @Permissions('hostel.incidents.manage')
  completeInspection(@User('org') organizationId: string, @Param('id') id: string, @Body() data: any, @User('id') actorId: string) { return this.service.completeInspection(organizationId, id, data, actorId); }

  @Post('visitors')
  @Permissions('hostel.manage')
  registerVisitor(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) { return this.service.registerVisitor(organizationId, data, actorId); }

  @Patch('visitors/:id/checkout')
  @Permissions('hostel.manage')
  checkoutVisitor(@User('org') organizationId: string, @Param('id') id: string, @User('id') actorId: string) { return this.service.checkoutVisitor(organizationId, id, actorId); }

  @Post('mess/attendance')
  @Permissions('hostel.attendance')
  markMess(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) { return this.service.markMess(organizationId, data, actorId); }

  @Post('transfers')
  @Permissions('hostel.transfer')
  requestTransfer(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) { return this.service.requestTransfer(organizationId, data, actorId); }

  @Patch('transfers/:id/complete')
  @Permissions('hostel.transfer')
  completeTransfer(@User('org') organizationId: string, @Param('id') id: string, @User('id') actorId: string) { return this.service.completeTransfer(organizationId, id, actorId); }

  @Get('operations')
  @Permissions('hostel.read')
  listOperations(@User('org') organizationId: string, @Query('schoolId') schoolId: string) { return this.service.listOperations(organizationId, schoolId); }
}
