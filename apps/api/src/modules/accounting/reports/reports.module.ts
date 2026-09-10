import { Module } from '@nestjs/common';
import { AccountingReportsService } from './reports.service';
import { AccountingReportsController } from './reports.controller';

@Module({
  controllers: [AccountingReportsController],
  providers: [AccountingReportsService],
  exports: [AccountingReportsService],
})
export class AccountingReportsModule {}
