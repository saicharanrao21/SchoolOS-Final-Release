import { Module } from '@nestjs/common';
import { OrganizationControlPlaneService } from './organization-control-plane.service';
import { OrganizationControlPlaneController } from './organization-control-plane.controller';
import { AcademicStructureService } from './academic-structure.service';
import { AcademicStructureController } from './academic-structure.controller';
import { SchoolCalendarService } from './school-calendar.service';
import { SchoolCalendarController } from './school-calendar.controller';
import { NumberingService } from './numbering.service';
import { NumberingController } from './numbering.controller';
import { ModuleConfigService } from './module-config.service';
import { ModuleConfigController } from './module-config.controller';
import { AuditModule } from '../../audit/audit.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [AuditModule, AuthModule],
  providers: [
    OrganizationControlPlaneService,
    AcademicStructureService,
    SchoolCalendarService,
    NumberingService,
    ModuleConfigService,
  ],
  controllers: [
    OrganizationControlPlaneController,
    AcademicStructureController,
    SchoolCalendarController,
    NumberingController,
    ModuleConfigController,
  ],
  exports: [
    OrganizationControlPlaneService,
    AcademicStructureService,
    SchoolCalendarService,
    NumberingService,
    ModuleConfigService,
  ],
})
export class ConfigModule {}
