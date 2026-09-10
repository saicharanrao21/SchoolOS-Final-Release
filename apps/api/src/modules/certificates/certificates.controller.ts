import { Controller, Get, Post, Body, Param, Patch, UseGuards, Query } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('certificates')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class CertificatesController {
  constructor(private readonly service: CertificatesService) {}

  @Post('templates')
  @Permissions('certificates.templates.manage')
  async createTemplate(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.createTemplate(organizationId, data, actorId);
  }

  @Post('issue')
  @Permissions('certificates.issue')
  async issue(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.issueCertificate(organizationId, data, actorId);
  }

  @Get('verify/:token')
  async verify(@Param('token') token: string) {
    return this.service.verifyCertificate(token);
  }

  @Patch(':id/revoke')
  @Permissions('certificates.revoke')
  async revoke(@User('org') organizationId: string, @Param('id') id: string, @Body('reason') reason: string, @User('id') actorId: string) {
    return this.service.revokeCertificate(organizationId, id, reason, actorId);
  }

  @Get('my')
  async getMyCertificates(@User('id') userId: string) {
    return this.service.findByRecipient(userId);
  }
}
