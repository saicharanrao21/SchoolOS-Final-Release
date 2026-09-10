import { Controller, Get, Post, Body, Param, Patch, UseGuards, Query } from '@nestjs/common';
import { DmsService } from './dms.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { VerificationStatus } from '@prisma/client';

@Controller('dms')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class DmsController {
  constructor(private readonly service: DmsService) {}

  @Post('upload')
  @Permissions('documents.upload')
  async upload(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.uploadDocument(organizationId, data, actorId);
  }

  @Patch(':id/verify')
  @Permissions('documents.verify')
  async verify(
    @User('org') organizationId: string,
    @Param('id') id: string,
    @Body('status') status: VerificationStatus,
    @User('id') actorId: string
  ) {
    return this.service.verifyDocument(organizationId, id, status, actorId);
  }

  @Get('owner/:type/:id')
  @Permissions('documents.read')
  async findByOwner(@Param('type') type: string, @Param('id') id: string) {
    return this.service.findByOwner(id, type);
  }

  @Get('expiring')
  @Permissions('documents.read')
  async getExpiring(@Query('schoolId') schoolId: string, @Query('days') days: string) {
    return this.service.getExpiringDocuments(schoolId, parseInt(days) || 30);
  }
}
