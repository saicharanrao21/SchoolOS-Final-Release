import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { PlatformFeatureFlagsService } from './feature-flags.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('platform/feature-flags')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class PlatformFeatureFlagsController {
  constructor(private readonly service: PlatformFeatureFlagsService) {}

  @Get()
  @Permissions('platform.feature_flags.read')
  async listFlags() {
    return this.service.listFlags();
  }

  @Post()
  @Permissions('platform.feature_flags.manage')
  async upsertFlag(@User('id') actorId: string, @Body() data: any) {
    return this.service.upsertFlag(data, actorId);
  }

  @Get('evaluate')
  async evaluateFlag(
    @User('org') organizationId: string,
    @Query('key') key: string,
  ) {
    const isEnabled = await this.service.evaluateFlag(key, organizationId);
    return { key, isEnabled };
  }
}
