import { Module } from '@nestjs/common';
import { VehiclesService } from './vehicles/vehicles.service';
import { RoutesService } from './routes/routes.service';
import { StudentAssignmentsService } from './assignments/assignments.service';
import { TripsService } from './trips/trips.service';
import { TrackingService } from './tracking/tracking.service';
import { TransportPoliciesService } from './policies/policies.service';
import { VehiclesController } from './vehicles/vehicles.controller';
import { RoutesController } from './routes/routes.controller';
import { StudentAssignmentsController } from './assignments/assignments.controller';
import { TripsController } from './trips/trips.controller';
import { TrackingController } from './tracking/tracking.controller';
import { TransportPoliciesController } from './policies/policies.controller';
import { TransportOperatorController } from './operator/transport-operator.controller';
import { TransportOperatorService } from './operator/transport-operator.service';
import { TransportMaintenanceController } from './maintenance/maintenance.controller';
import { TransportMaintenanceService } from './maintenance/maintenance.service';

@Module({
  controllers: [
    VehiclesController,
    RoutesController,
    StudentAssignmentsController,
    TripsController,
    TrackingController,
    TransportPoliciesController,
    TransportOperatorController,
    TransportMaintenanceController,
  ],
  providers: [
    VehiclesService,
    RoutesService,
    StudentAssignmentsService,
    TripsService,
    TrackingService,
    TransportPoliciesService,
    TransportOperatorService,
    TransportMaintenanceService,
  ],
  exports: [
    VehiclesService,
    RoutesService,
    StudentAssignmentsService,
    TripsService,
    TrackingService,
    TransportPoliciesService,
    TransportOperatorService,
    TransportMaintenanceService,
  ],
})
export class TransportModule {}
