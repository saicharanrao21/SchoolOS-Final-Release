import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { PolicyGuard } from '../../auth/guards/policy.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { ModuleConfigService } from './module-config.service';

@Controller('management/module-config')
@UseGuards(AuthGuard('jwt'), PermissionsGuard, PolicyGuard)
export class ModuleConfigController {
  constructor(private readonly service: ModuleConfigService) {}

  @Get()
  @Permissions('settings.read')
  async getModuleConfigs(@Query('schoolId') schoolId: string) {
    return this.service.getModuleConfigs(schoolId);
  }

  @Post()
  @Permissions('settings.manage')
  async setModuleConfig(@Body() body: { schoolId: string; moduleKey: string; enabled: boolean; settings?: any }) {
    return this.service.setModuleConfig(body.schoolId, body.moduleKey, body.enabled, body.settings);
  }
}
