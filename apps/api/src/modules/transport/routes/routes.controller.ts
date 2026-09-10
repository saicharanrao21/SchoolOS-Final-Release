import { Controller, Get, Post, Body, Param, Patch, UseGuards, Query } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('transport/routes')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class RoutesController {
  constructor(private readonly service: RoutesService) {}

  @Post()
  @Permissions('route.manage')
  create(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.createRoute(organizationId, data, actorId);
  }

  @Get()
  @Permissions('route.read')
  findAll(@User('org') organizationId: string, @Query('schoolId') schoolId: string) {
    return this.service.findAllRoutes(organizationId, schoolId);
  }

  @Get(':id')
  @Permissions('route.read')
  findOne(@User('org') organizationId: string, @Param('id') id: string) {
    return this.service.findOneRoute(organizationId, id);
  }

  @Patch(':id')
  @Permissions('route.manage')
  update(@User('org') organizationId: string, @Param('id') id: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.updateRoute(organizationId, id, data, actorId);
  }
}
