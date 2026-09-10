import { Module } from '@nestjs/common';
import { HrEmployeesService } from './employees/hr-employees.service';
import { HrEmployeesController } from './employees/hr-employees.controller';
import { HrDesignationsService } from './designations/hr-designations.service';
import { HrDesignationsController } from './designations/hr-designations.controller';
import { HrSelfServiceService } from './self-service/hr-self-service.service';
import { HrSelfServiceController } from './self-service/hr-self-service.controller';
import { HrComplianceService } from './compliance/hr-compliance.service';
import { HrComplianceController } from './compliance/hr-compliance.controller';

@Module({
  controllers: [HrEmployeesController, HrDesignationsController, HrSelfServiceController, HrComplianceController],
  providers: [HrEmployeesService, HrDesignationsService, HrSelfServiceService, HrComplianceService],
  exports: [HrEmployeesService, HrDesignationsService, HrSelfServiceService, HrComplianceService],
})
export class HrModule {}
