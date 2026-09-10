import { Controller, Get, Post, Body, UseGuards, Query, Param } from '@nestjs/common';
import { JournalEntriesService } from './journal-entries.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('accounting/journal-entries')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class JournalEntriesController {
  constructor(private readonly service: JournalEntriesService) {}

  @Post()
  @Permissions('accounting.post')
  create(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.create(organizationId, data, actorId);
  }

  @Get()
  @Permissions('accounting.read')
  findAll(@User('org') organizationId: string, @Query() filters: any) {
    return this.service.findAll(organizationId, filters);
  }

  @Get(':id')
  @Permissions('accounting.read')
  findOne(@User('org') organizationId: string, @Param('id') id: string) {
    return this.service.findOne(organizationId, id);
  }
}
