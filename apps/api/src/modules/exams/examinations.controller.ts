import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ExaminationsService } from './examinations.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('exams/examinations')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ExaminationsController {
  constructor(private readonly service: ExaminationsService) {}

  @Post()
  @Permissions('exams.create')
  create(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.create(organizationId, data, actorId);
  }

  @Post(':id/subjects')
  @Permissions('exams.update')
  addSubject(@User('org') organizationId: string, @Param('id') id: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.addSubject(organizationId, id, data, actorId);
  }

  @Get()
  @Permissions('exams.read')
  findAll(@User('org') organizationId: string, @Query() filters: any) {
    return this.service.findAll(organizationId, filters);
  }

  @Get(':id')
  @Permissions('exams.read')
  findOne(@User('org') organizationId: string, @Param('id') id: string) {
    return this.service.findOne(organizationId, id);
  }
}
