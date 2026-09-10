import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { LedgersService } from './ledgers.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('finance/ledgers')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class LedgersController {
  constructor(private readonly service: LedgersService) {}

  @Get()
  @Permissions('fees.read')
  findAll(@User('org') organizationId: string, @Query() filters: any) {
    return this.service.findAll(organizationId, filters);
  }
}
