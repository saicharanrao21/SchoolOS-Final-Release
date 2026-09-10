import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { ExamsConfigService } from './exams-config.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('exams/config')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ExamsConfigController {
  constructor(private readonly service: ExamsConfigService) {}

  @Post('types')
  @Permissions('exams.create')
  createType(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.createType(organizationId, data, actorId);
  }

  @Get('types')
  @Permissions('exams.read')
  findAllTypes(@User('org') organizationId: string, @Query('schoolId') schoolId: string) {
    return this.service.findAllTypes(organizationId, schoolId);
  }

  @Post('components')
  @Permissions('exams.create')
  createComponent(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.createComponent(organizationId, data, actorId);
  }

  @Get('components')
  @Permissions('exams.read')
  findAllComponents(@User('org') organizationId: string, @Query('schoolId') schoolId: string) {
    return this.service.findAllComponents(organizationId, schoolId);
  }
}
