import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { TermsService } from './terms.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('terms')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class TermsController {
  constructor(private readonly termsService: TermsService) {}

  @Post()
  @Permissions('academic_year.update')
  create(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.termsService.create(organizationId, data, actorId);
  }

  @Get()
  @Permissions('academic_year.read')
  findAll(@User('org') organizationId: string, @Query('academicYearId') academicYearId: string) {
    return this.termsService.findAll(organizationId, academicYearId);
  }

  @Get(':id')
  @Permissions('academic_year.read')
  findOne(@User('org') organizationId: string, @Param('id') id: string) {
    return this.termsService.findOne(organizationId, id);
  }
}
