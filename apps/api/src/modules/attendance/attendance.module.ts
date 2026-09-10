import { Module } from '@nestjs/common';
import { AttendancePoliciesService } from './policies/policies.service';
import { AttendanceSessionsService } from './sessions/sessions.service';
import { AttendanceRecordsService } from './records/records.service';
import { AttendanceCorrectionsService } from './corrections/corrections.service';
import { AttendanceSessionsController } from './sessions/sessions.controller';
import { AttendanceRecordsController } from './records/records.controller';
import { AttendanceCorrectionsController } from './corrections/corrections.controller';
import { AttendancePoliciesController } from './policies/policies.controller';
import { WorkingDaysService } from './working-days.service';

@Module({
  controllers: [
    AttendanceSessionsController,
    AttendanceRecordsController,
    AttendanceCorrectionsController,
    AttendancePoliciesController,
  ],
  providers: [
    AttendancePoliciesService,
    AttendanceSessionsService,
    AttendanceRecordsService,
    AttendanceCorrectionsService,
    WorkingDaysService,
  ],
  exports: [
    AttendancePoliciesService,
    AttendanceSessionsService,
    AttendanceRecordsService,
    AttendanceCorrectionsService,
    WorkingDaysService,
  ],
})
export class AttendanceModule {}
