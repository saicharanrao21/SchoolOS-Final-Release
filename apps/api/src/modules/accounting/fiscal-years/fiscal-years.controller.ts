import { Controller, Get, Post, Body, Param, UseGuards, Query, Patch } from '@nestjs/common';
import { FiscalYearsService } from './fiscal-years.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('accounting/fiscal-years')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class FiscalYearsController {
  constructor(private readonly service: FiscalYearsService) {}

  @Post()
  @Permissions('accounting.manage')
  create(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.create(organizationId, data, actorId);
  }

  @Get()
  @Permissions('accounting.read')
  findAll(@User('org') organizationId: string, @Query('schoolId') schoolId: string) {
    return this.service.findAll(organizationId, schoolId);
  }

  @Patch(':id/open')
  @Permissions('accounting.manage')
  open(@User('org') organizationId: string, @Param('id') id: string, @User('id') actorId: string) {
    return this.service.open(organizationId, id, actorId);
  }
}
