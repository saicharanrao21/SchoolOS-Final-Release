import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { GuardiansService } from './guardians.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('guardians')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class GuardiansController {
  constructor(private readonly guardiansService: GuardiansService) {}

  @Post()
  @Permissions('guardian.create')
  create(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.guardiansService.create(organizationId, data, actorId);
  }

  @Get()
  @Permissions('guardian.read')
  findAll(@User('org') organizationId: string, @Query('search') search?: string) {
    return this.guardiansService.findAll(organizationId, search);
  }

  @Get(':id')
  @Permissions('guardian.read')
  findOne(@Param('id') id: string) {
    return this.guardiansService.findOne(id);
  }

  @Post(':id/link-student')
  @Permissions('guardian.update')
  linkStudent(@Param('id') id: string, @Body() data: any) {
    return this.guardiansService.linkToStudent(id, data.studentId, data.relationship, data.isPrimary);
  }
}
