import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('accounting/accounts')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class AccountsController {
  constructor(private readonly service: AccountsService) {}

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

  @Post('seed')
  @Permissions('accounting.manage')
  seed(@User('org') organizationId: string, @Body('schoolId') schoolId: string, @User('id') actorId: string) {
    return this.service.seedDefaultAccounts(organizationId, schoolId, actorId);
  }
}
