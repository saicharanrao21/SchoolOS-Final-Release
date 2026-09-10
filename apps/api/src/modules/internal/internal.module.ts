import { Module } from '@nestjs/common';
import { InternalFinanceService } from './finance/internal-finance.service';
import { InternalFinanceController } from './finance/internal-finance.controller';
import { InternalVendorsService } from './vendors/internal-vendors.service';
import { InternalVendorsController } from './vendors/internal-vendors.controller';
import { InternalLegalService } from './legal/legal.service';
import { InternalLegalController } from './legal/legal.controller';
import { CompanyContractsService } from './contracts/contracts.service';
import { CompanyContractsController } from './contracts/contracts.controller';

@Module({
  controllers: [
    InternalFinanceController,
    InternalVendorsController,
    InternalLegalController,
    CompanyContractsController,
  ],
  providers: [
    InternalFinanceService,
    InternalVendorsService,
    InternalLegalService,
    CompanyContractsService,
  ],
  exports: [
    InternalFinanceService,
    InternalVendorsService,
    InternalLegalService,
    CompanyContractsService,
  ],
})
export class InternalModule {}
