import { Module } from '@nestjs/common';
import { PtmService } from './ptm.service';
import { PtmController } from './ptm.controller';

@Module({
  controllers: [PtmController],
  providers: [PtmService],
  exports: [PtmService],
})
export class PtmModule {}
