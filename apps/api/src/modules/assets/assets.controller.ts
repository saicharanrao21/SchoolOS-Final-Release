import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('assets')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class AssetsController {
  constructor(private readonly service: AssetsService) {}

  @Post()
  @Permissions('asset.create')
  async createAsset(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.createAsset(organizationId, data, actorId);
  }

  @Post('assign')
  @Permissions('asset.assign')
  async assignAsset(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.assignAsset(organizationId, data, actorId);
  }

  @Post('maintenance')
  @Permissions('asset.maintenance')
  async recordMaintenance(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.recordMaintenance(organizationId, data, actorId);
  }

  @Get('dashboard')
  @Permissions('asset.read')
  async getDashboard(@User('org') organizationId: string, @Query('schoolId') schoolId: string) {
    return this.service.getDashboard(organizationId, schoolId);
  }

  @Get()
  @Permissions('asset.read')
  async findAll(@Query('schoolId') schoolId: string) {
    return this.service.findAllAssets(schoolId);
  }
}
