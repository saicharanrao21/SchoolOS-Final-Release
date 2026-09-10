import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { Prisma } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';
import { User } from '../../../auth/decorators/user.decorator';

@Controller('organizations')
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @Roles('SUPER_ADMIN')
  @Permissions('organization.create')
  create(@Body() data: Prisma.OrganizationCreateInput, @User('id') actorId: string) {
    return this.organizationsService.create(data, actorId);
  }

  @Get()
  @Roles('SUPER_ADMIN')
  @Permissions('organization.read')
  findAll() {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  @Permissions('organization.read')
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Patch(':id')
  @Permissions('organization.update')
  update(@Param('id') id: string, @Body() data: Prisma.OrganizationUpdateInput, @User('id') actorId: string) {
    return this.organizationsService.update(id, data, actorId);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @Permissions('organization.archive')
  remove(@Param('id') id: string, @User('id') actorId: string) {
    return this.organizationsService.remove(id, actorId);
  }
}
