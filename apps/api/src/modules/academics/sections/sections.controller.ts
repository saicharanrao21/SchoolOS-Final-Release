import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('sections')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  @Permissions('class.update')
  create(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.sectionsService.create(organizationId, data, actorId);
  }

  @Get()
  @Permissions('class.read')
  findAll(@User('org') organizationId: string, @Query('classId') classId: string) {
    return this.sectionsService.findAll(organizationId, classId);
  }

  @Patch(':id/teacher')
  @Permissions('role.manage')
  updateClassTeacher(
    @User('org') organizationId: string,
    @Param('id') id: string,
    @Body('teacherId') teacherId: string,
    @User('id') actorId: string
  ) {
    return this.sectionsService.updateClassTeacher(organizationId, id, teacherId, actorId);
  }
}
