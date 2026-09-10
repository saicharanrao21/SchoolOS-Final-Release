import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { User } from '../../auth/decorators/user.decorator';
import { CmsService } from './cms.service';

@Controller('cms')
export class CmsController {
  constructor(private readonly service: CmsService) {}

  // --- Public Unprotected Website Rendering Endpoints ---

  @Get('public/:schoolSlug')
  async getPublicWebsite(@Param('schoolSlug') schoolSlug: string) {
    return this.service.getPublicWebsite(schoolSlug);
  }

  @Post('public/:schoolSlug/enquiry')
  async submitPublicEnquiry(@Param('schoolSlug') schoolSlug: string, @Body() data: any) {
    return this.service.submitPublicEnquiry(schoolSlug, data);
  }

  // --- Protected Admin CMS Endpoints ---

  @Get('pages')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('settings.read')
  async getPages(@User('org') organizationId: string, @Query('schoolId') schoolId: string) {
    return this.service.getPages(organizationId, schoolId);
  }

  @Post('pages')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('settings.manage')
  async createPage(
    @User('org') organizationId: string,
    @Query('schoolId') schoolId: string,
    @Body() data: any,
    @User('id') actorId: string,
  ) {
    return this.service.createPage(organizationId, schoolId, data, actorId);
  }
}
