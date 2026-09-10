import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { HrDesignationsService } from './hr-designations.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('hr/designations')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class HrDesignationsController {
  constructor(private readonly service: HrDesignationsService) {}

  @Post()
  @Permissions('hr.employee.update')
  async create(@User('org') organizationId: string, @Body() data: any) {
    return this.service.create(organizationId, data);
  }

  @Get()
  @Permissions('hr.employee.read')
  async findAll(@User('org') organizationId: string, @Query('schoolId') schoolId: string) {
    return this.service.findAll(organizationId, schoolId);
  }
}
