import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { StudentAssignmentsService } from './assignments.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('transport/assignments')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class StudentAssignmentsController {
  constructor(private readonly service: StudentAssignmentsService) {}

  @Post()
  @Permissions('transport.assignment.manage')
  assign(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.assign(organizationId, data, actorId);
  }

  @Get()
  @Permissions('transport.assignment.read')
  findAll(@User('org') organizationId: string, @Query() filters: any) {
    return this.service.findAll(organizationId, filters);
  }

  @Delete(':id')
  @Permissions('transport.assignment.manage')
  remove(@User('org') organizationId: string, @Param('id') id: string, @User('id') actorId: string) {
    return this.service.remove(organizationId, id, actorId);
  }
}
