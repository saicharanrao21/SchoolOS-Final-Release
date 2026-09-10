import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('settings')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  @Permissions('school.update')
  upsert(
    @Body('schoolId') schoolId: string,
    @Body('category') category: string,
    @Body('key') key: string,
    @Body('value') value: any,
    @User('id') actorId: string
  ) {
    return this.settingsService.upsert(schoolId, category, key, value, actorId);
  }

  @Get()
  @Permissions('school.read')
  findAll(@Query('schoolId') schoolId: string, @Query('category') category?: string) {
    return this.settingsService.findAll(schoolId, category);
  }
}
