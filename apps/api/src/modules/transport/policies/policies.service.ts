import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';

@Injectable()
export class TransportPoliciesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async findBySchool(organizationId: string, schoolId: string) {
    let policy = await this.db.transportPolicy.findFirst({
      where: { schoolId, school: { organizationId } },
    });

    if (!policy) {
      // Create default policy if not exists
      policy = await this.db.transportPolicy.create({
        data: { schoolId },
      });
    }

    return policy;
  }

  async update(organizationId: string, schoolId: string, data: any, actorId: string) {
    const policy = await this.findBySchool(organizationId, schoolId);

    const updated = await this.db.transportPolicy.update({
      where: { id: policy.id },
      data: {
        pickupVerificationRequired: data.pickupVerificationRequired,
        geofenceRadiusMeters: data.geofenceRadiusMeters,
        gpsIntervalSeconds: data.gpsIntervalSeconds,
        lateThresholdMins: data.lateThresholdMins,
        routeDeviationThresholdMeters: data.routeDeviationThresholdMeters,
      },
    });

    await this.audit.log({
      action: 'transport.policy.update',
      resource: 'TransportPolicy',
      resourceId: updated.id,
      actorId,
      organizationId,
      schoolId,
    });

    return updated;
  }
}
