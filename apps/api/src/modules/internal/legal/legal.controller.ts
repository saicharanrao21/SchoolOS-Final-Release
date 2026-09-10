import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { InternalLegalService } from './legal.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('internal/legal')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class InternalLegalController {
  constructor(private readonly service: InternalLegalService) {}

  @Post()
  @Permissions('internal.legal.manage')
  async create(
    @User('org') organizationId: string,
    @User('id') actorId: string,
    @Body() data: any,
  ) {
    return this.service.createLegalMatter(organizationId, data, actorId);
  }

  @Get()
  @Permissions('internal.legal.read')
  async getLegalMatters(@User('org') organizationId: string) {
    return this.service.getLegalMatters(organizationId);
  }
}
