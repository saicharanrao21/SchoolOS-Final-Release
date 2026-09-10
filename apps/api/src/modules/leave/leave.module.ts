import { Module } from '@nestjs/common';
import { LeaveTypesService } from './types/types.service';
import { LeaveRequestsService } from './requests/requests.service';
import { LeaveBalancesService } from './balances/balances.service';
import { LeaveRequestsController } from './requests/requests.controller';
import { LeaveTypesController } from './types/types.controller';
import { LeaveBalancesController } from './balances/balances.controller';

@Module({
  controllers: [
    LeaveRequestsController,
    LeaveTypesController,
    LeaveBalancesController,
  ],
  providers: [
    LeaveTypesService,
    LeaveRequestsService,
    LeaveBalancesService,
  ],
  exports: [
    LeaveTypesService,
    LeaveRequestsService,
    LeaveBalancesService,
  ],
})
export class LeaveModule {}
