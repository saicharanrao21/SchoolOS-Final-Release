import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DataExchangeService } from './data-exchange.service';
import { User } from '../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('exchange')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class DataExchangeController {
  constructor(private readonly service: DataExchangeService) {}

  @Get('templates')
  @Permissions('imports.read')
  getTemplates() { return this.service.getTemplates(); }

  @Get('catalog')
  @Permissions('exports.read')
  getExportCatalog() { return this.service.getExportCatalog(); }

  @Post('validate')
  @Permissions('imports.create')
  validate(@Body() data: { template: string; rows: Array<Record<string, unknown>> }) {
    return this.service.validateRows(data.template, data.rows);
  }

  @Post('import')
  @Permissions('imports.create')
  async createImport(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.createImportJob(organizationId, data, actorId);
  }

  @Post('export')
  @Permissions('exports.create')
  async createExport(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.createExportJob(organizationId, data, actorId);
  }

  @Get('jobs')
  @Permissions('imports.read', 'exports.read')
  async listJobs(@User('org') organizationId: string, @Query('schoolId') schoolId: string) {
    return this.service.listJobs(organizationId, schoolId);
  }

  @Get('import/:id')
  @Permissions('imports.read')
  async getImportStatus(@User('org') organizationId: string, @Query('schoolId') schoolId: string, @Param('id') id: string) {
    return this.service.getImportStatus(organizationId, schoolId, id);
  }

  @Get('export/:id')
  @Permissions('exports.read')
  async getExportStatus(@User('org') organizationId: string, @Query('schoolId') schoolId: string, @Param('id') id: string) {
    return this.service.getExportStatus(organizationId, schoolId, id);
  }
}
