import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentPortalController } from './student-portal.controller';
import { StudentEnrollmentsController } from './enrollments.controller';
import { StudentHistoryController } from './student-history.controller';
import { StudentDocumentsController } from './student-documents.controller';
import { StudentLifecycleController } from './student-lifecycle.controller';
import { StudentsService } from './students.service';
import { StudentApiService } from './student-api.service';
import { EnrollmentsService } from './enrollments.service';
import { StudentHistoryService } from './student-history.service';
import { StudentDocumentsService } from './student-documents.service';
import { StudentLifecycleService } from './student-lifecycle.service';

@Module({
  controllers: [
    StudentsController,
    StudentPortalController,
    StudentEnrollmentsController,
    StudentHistoryController,
    StudentDocumentsController,
    StudentLifecycleController,
  ],
  providers: [
    StudentsService,
    StudentApiService,
    EnrollmentsService,
    StudentHistoryService,
    StudentDocumentsService,
    StudentLifecycleService,
  ],
  exports: [
    StudentsService,
    StudentApiService,
    EnrollmentsService,
    StudentHistoryService,
    StudentDocumentsService,
    StudentLifecycleService,
  ],
})
export class StudentsModule {}
