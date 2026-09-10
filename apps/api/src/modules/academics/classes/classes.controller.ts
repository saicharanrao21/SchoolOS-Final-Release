import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('classes')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @Permissions('class.create')
  create(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.classesService.create(organizationId, data, actorId);
  }

  @Get()
  @Permissions('class.read')
  findAll(@User('org') organizationId: string, @Query('schoolId') schoolId: string) {
    return this.classesService.findAll(organizationId, schoolId);
  }

  @Get(':id')
  @Permissions('class.read')
  findOne(@User('org') organizationId: string, @Param('id') id: string) {
    return this.classesService.findOne(organizationId, id);
  }
}
