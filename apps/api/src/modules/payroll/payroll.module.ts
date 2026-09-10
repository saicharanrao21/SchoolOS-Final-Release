import { Module } from '@nestjs/common';
import { PayrollRunsService } from './runs/payroll-runs.service';
import { PayrollSalariesService } from './salaries/payroll-salaries.service';
import { PayrollController } from './payroll.controller';
import { AccountingModule } from '../accounting/accounting.module';

@Module({
  imports: [AccountingModule],
  controllers: [PayrollController],
  providers: [PayrollRunsService, PayrollSalariesService],
  exports: [PayrollRunsService, PayrollSalariesService],
})
export class PayrollModule {}
