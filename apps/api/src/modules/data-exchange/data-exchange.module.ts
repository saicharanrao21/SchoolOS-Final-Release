import { Module } from '@nestjs/common';
import { DataExchangeService } from './data-exchange.service';
import { DataExchangeController } from './data-exchange.controller';

@Module({
  controllers: [DataExchangeController],
  providers: [DataExchangeService],
  exports: [DataExchangeService],
})
export class DataExchangeModule {}
