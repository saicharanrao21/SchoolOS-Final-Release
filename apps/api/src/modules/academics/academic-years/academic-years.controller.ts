import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { AcademicYearsService } from './academic-years.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';
import { AcademicYearStatus } from '@prisma/client';

@Controller('academic-years')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class AcademicYearsController {
  constructor(private readonly academicYearsService: AcademicYearsService) {}

  @Post()
  @Permissions('academic_year.create')
  create(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.academicYearsService.create(organizationId, data, actorId);
  }

  @Get()
  @Permissions('academic_year.read')
  findAll(@User('org') organizationId: string, @Query('schoolId') schoolId?: string) {
    return this.academicYearsService.findAll(organizationId, schoolId);
  }

  @Get(':id')
  @Permissions('academic_year.read')
  findOne(@User('org') organizationId: string, @Param('id') id: string) {
    return this.academicYearsService.findOne(organizationId, id);
  }

  @Patch(':id/current')
  @Permissions('academic_year.update')
  setCurrent(@User('org') organizationId: string, @Param('id') id: string, @User('id') actorId: string) {
    return this.academicYearsService.setCurrent(organizationId, id, actorId);
  }

  @Patch(':id/status')
  @Permissions('academic_year.update')
  updateStatus(
    @User('org') organizationId: string,
    @Param('id') id: string,
    @Body('status') status: AcademicYearStatus,
    @User('id') actorId: string
  ) {
    return this.academicYearsService.updateStatus(organizationId, id, status, actorId);
  }
}
