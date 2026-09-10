import { Module } from '@nestjs/common';
import { EnquiriesModule } from './enquiries/enquiries.module';
import { ApplicationsModule } from './applications/applications.module';
import { AssessmentsModule } from './assessments/assessments.module';
import { InterviewsModule } from './interviews/interviews.module';
import { DecisionsModule } from './decisions/decisions.module';
import { OffersModule } from './offers/offers.module';

@Module({
  imports: [
    EnquiriesModule,
    ApplicationsModule,
    AssessmentsModule,
    InterviewsModule,
    DecisionsModule,
    OffersModule,
  ],
  exports: [
    EnquiriesModule,
    ApplicationsModule,
    AssessmentsModule,
    InterviewsModule,
    DecisionsModule,
    OffersModule,
  ],
})
export class AdmissionsModule {}
