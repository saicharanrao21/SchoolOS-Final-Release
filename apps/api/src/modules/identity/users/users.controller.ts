import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';
import { UserStatus } from '@prisma/client';

@Controller('users')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Permissions('user.create')
  create(@User('org') organizationId: string, @Body() data: any) {
    return this.usersService.create(organizationId, data);
  }

  @Get()
  @Permissions('user.read')
  findAll(@User('org') organizationId: string) {
    return this.usersService.findAll(organizationId);
  }

  @Get('me')
  getMe(@User() user: any) {
    return user;
  }

  @Get(':id')
  @Permissions('user.read')
  findOne(@User('org') organizationId: string, @Param('id') id: string) {
    return this.usersService.findOne(organizationId, id);
  }

  @Patch(':id/status')
  @Permissions('user.update')
  updateStatus(
    @User('org') organizationId: string,
    @Param('id') id: string,
    @Body('status') status: UserStatus
  ) {
    return this.usersService.updateStatus(organizationId, id, status);
  }
}
