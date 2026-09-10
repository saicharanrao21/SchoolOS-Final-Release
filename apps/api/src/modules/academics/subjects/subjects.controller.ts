import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('subjects')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  @Permissions('school.update')
  create(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.subjectsService.create(organizationId, data, actorId);
  }

  @Get()
  @Permissions('school.read')
  findAll(@User('org') organizationId: string, @Query('schoolId') schoolId: string) {
    return this.subjectsService.findAll(organizationId, schoolId);
  }

  @Post(':id/assign')
  @Permissions('school.update')
  assignToClass(
    @User('org') organizationId: string,
    @Param('id') id: string,
    @Body('classId') classId: string,
    @User('id') actorId: string
  ) {
    return this.subjectsService.assignToClass(organizationId, id, classId, actorId);
  }
}
