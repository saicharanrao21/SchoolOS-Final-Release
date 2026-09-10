import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { PolicyGuard } from '../../auth/guards/policy.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { User } from '../../auth/decorators/user.decorator';
import { AcademicStructureService } from './academic-structure.service';

@Controller('management/academic-structure')
@UseGuards(AuthGuard('jwt'), PermissionsGuard, PolicyGuard)
export class AcademicStructureController {
  constructor(private readonly service: AcademicStructureService) {}

  @Get('years')
  @Permissions('academics.read')
  async getAcademicYears(
    @User('org') organizationId: string,
    @Query('schoolId') schoolId: string,
  ) {
    return this.service.getAcademicYears(organizationId, schoolId);
  }

  @Post('years')
  @Permissions('academics.manage')
  async createAcademicYear(
    @User('org') organizationId: string,
    @User('id') actorId: string,
    @Body() data: any,
  ) {
    return this.service.createAcademicYear(organizationId, data.schoolId, actorId, data);
  }

  @Get('classes')
  @Permissions('academics.read')
  async getClassesAndSections(
    @User('org') organizationId: string,
    @Query('schoolId') schoolId: string,
  ) {
    return this.service.getClassesAndSections(organizationId, schoolId);
  }

  @Post('classes')
  @Permissions('academics.manage')
  async createClass(
    @User('org') organizationId: string,
    @Body() data: any,
  ) {
    return this.service.createClass(organizationId, data.schoolId, data);
  }

  @Post('classes/:classId/sections')
  @Permissions('academics.manage')
  async createSection(
    @User('org') organizationId: string,
    @Param('classId') classId: string,
    @Body() data: any,
  ) {
    return this.service.createSection(organizationId, classId, data);
  }

  @Get('subjects')
  @Permissions('academics.read')
  async getSubjects(
    @User('org') organizationId: string,
    @Query('schoolId') schoolId: string,
  ) {
    return this.service.getSubjects(organizationId, schoolId);
  }

  @Post('subjects')
  @Permissions('academics.manage')
  async createSubject(
    @User('org') organizationId: string,
    @Body() data: any,
  ) {
    return this.service.createSubject(organizationId, data.schoolId, data);
  }

  @Get('departments')
  @Permissions('settings.read')
  async getDepartments(
    @User('org') organizationId: string,
    @Query('schoolId') schoolId: string,
  ) {
    return this.service.getDepartments(organizationId, schoolId);
  }

  @Post('departments')
  @Permissions('settings.manage')
  async createDepartment(
    @User('org') organizationId: string,
    @Body() data: any,
  ) {
    return this.service.createDepartment(organizationId, data.schoolId, data);
  }

  @Get('houses')
  @Permissions('settings.read')
  async getHouses(
    @User('org') organizationId: string,
    @Query('schoolId') schoolId: string,
  ) {
    return this.service.getHouses(organizationId, schoolId);
  }

  @Post('houses')
  @Permissions('settings.manage')
  async createHouse(
    @User('org') organizationId: string,
    @Body() data: any,
  ) {
    return this.service.createHouse(organizationId, data.schoolId, data);
  }
}
