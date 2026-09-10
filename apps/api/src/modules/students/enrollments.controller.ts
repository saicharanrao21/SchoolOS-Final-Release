import { Controller, Post, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('student-enrollments')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class StudentEnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @Permissions('student.create')
  enroll(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.enrollmentsService.enroll(organizationId, data, actorId);
  }

  @Patch(':id/promote')
  @Permissions('student.promote')
  promote(
    @User('org') organizationId: string,
    @Param('id') id: string,
    @Body() data: any,
    @User('id') actorId: string
  ) {
    return this.enrollmentsService.promote(organizationId, id, data, actorId);
  }
}
