import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { PolicyGuard } from '../../auth/guards/policy.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { User } from '../../auth/decorators/user.decorator';
import { NumberingService } from './numbering.service';

@Controller('management/numbering')
@UseGuards(AuthGuard('jwt'), PermissionsGuard, PolicyGuard)
export class NumberingController {
  constructor(private readonly numberingService: NumberingService) {}

  @Get('sequences')
  @Permissions('settings.read')
  async getSequences(
    @User('org') organizationId: string,
    @Query('schoolId') schoolId?: string,
  ) {
    return this.numberingService.getSequences(organizationId, schoolId);
  }

  @Post('sequences')
  @Permissions('settings.manage')
  async configureSequence(
    @User('org') organizationId: string,
    @Body() body: any,
  ) {
    return this.numberingService.configureSequence({
      organizationId,
      ...body,
    });
  }

  @Post('next-number')
  @Permissions('settings.manage')
  async generateNextNumber(
    @User('org') organizationId: string,
    @Body() body: { entityType: string; schoolId?: string },
  ) {
    const generated = await this.numberingService.generateNextNumber(organizationId, body.entityType, body.schoolId);
    return { entityType: body.entityType, generatedNumber: generated };
  }
}
