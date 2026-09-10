import { Controller, Get, Post, Body, Param, Patch, UseGuards, Query } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('academics/assignments')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class AssignmentsController {
  constructor(private readonly service: AssignmentsService) {}

  @Post()
  @Permissions('homework.create')
  create(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.create(organizationId, data, actorId);
  }

  @Get()
  @Permissions('homework.read')
  findAll(@User('org') organizationId: string, @Query() filters: any) {
    return this.service.findAll(organizationId, filters);
  }

  @Post(':id/submit')
  @Permissions('submission.create')
  submit(@User('id') studentId: string, @Param('id') id: string, @Body() data: any) {
    return this.service.submit(studentId, id, data);
  }

  @Get(':id/submissions')
  @Permissions('submission.read')
  getSubmissions(@Param('id') id: string) {
    return this.service.getSubmissions(id);
  }

  @Post('submissions/:submissionId/review')
  @Permissions('assignment.review')
  review(@User('id') employeeId: string, @Param('submissionId') submissionId: string, @Body() data: any) {
    return this.service.review(submissionId, employeeId, data);
  }
}
