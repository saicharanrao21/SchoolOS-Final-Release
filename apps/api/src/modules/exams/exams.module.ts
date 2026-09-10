import { Module } from '@nestjs/common';
import { ExamsConfigService } from './config/exams-config.service';
import { ExaminationsService } from './examinations.service';
import { ExamSchedulesService } from './schedules/exam-schedules.service';
import { MarksEntryService } from './marks/marks-entry.service';
import { ResultsService } from './results/results.service';
import { ExaminationsController } from './examinations.controller';
import { ExamsConfigController } from './config/exams-config.controller';
import { ExamSchedulesController } from './schedules/exam-schedules.controller';
import { MarksEntryController } from './marks/marks-entry.controller';
import { ResultsController } from './results/results.controller';

import { ReportCardsController } from './report-cards/report-cards.controller';
import { ReportCardsService } from './report-cards/report-cards.service';
import { CbtExamController } from './cbt/cbt.controller';
import { CbtExamService } from './cbt/cbt.service';
import { DmsModule } from '../dms/dms.module';

@Module({
  imports: [DmsModule],
  controllers: [
    ExaminationsController,
    ExamsConfigController,
    ExamSchedulesController,
    MarksEntryController,
    ResultsController,
    ReportCardsController,
    CbtExamController,
  ],
  providers: [
    ExamsConfigService,
    ExaminationsService,
    ExamSchedulesService,
    MarksEntryService,
    ResultsService,
    ReportCardsService,
    CbtExamService,
  ],
  exports: [
    ExamsConfigService,
    ExaminationsService,
    ExamSchedulesService,
    MarksEntryService,
    ResultsService,
    ReportCardsService,
    CbtExamService,
  ],
})
export class ExamsModule {}
