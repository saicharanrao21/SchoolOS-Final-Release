import { Module } from '@nestjs/common';
import { StudentHealthController } from './student-health.controller';
import { StudentHealthService } from './student-health.service';

@Module({
  controllers: [StudentHealthController],
  providers: [StudentHealthService],
  exports: [StudentHealthService],
})
export class StudentHealthModule {}
