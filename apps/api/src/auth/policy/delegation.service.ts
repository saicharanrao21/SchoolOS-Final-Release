import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';
import { AuthorizationService } from './authorization.service';
import { AuditSeverity } from '@prisma/client';

@Injectable()
export class DelegationService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
    private readonly authz: AuthorizationService,
  ) {}

  async createDelegation(
    organizationId: string,
    delegatorId: string,
    data: {
      delegateeId: string;
      schoolId?: string;
      campusId?: string;
      roleId?: string;
      permissions?: string[];
      validUntil: Date;
      reason: string;
    },
  ) {
    if (delegatorId === data.delegateeId) {
      throw new BadRequestException('Cannot delegate authority to yourself');
    }

    const delegatee = await this.db.user.findFirst({
      where: { id: data.delegateeId, organizationId },
    });
    if (!delegatee) throw new NotFoundException('Delegatee user not found in organization');

    // Escalation Prevention: Verify delegator possesses all delegated permissions
    const delegatorPerms = await this.authz.resolveEffectivePermissions({
      userId: delegatorId,
      organizationId,
      schoolId: data.schoolId,
    });

    if (data.permissions && data.permissions.length > 0) {
      for (const perm of data.permissions) {
        if (!delegatorPerms.has(perm)) {
          throw new ForbiddenException(`Delegation escalation blocked: You do not possess permission '${perm}'`);
        }
      }
    }

    const delegation = await this.db.authorityDelegation.create({
      data: {
        organizationId,
        schoolId: data.schoolId,
        campusId: data.campusId,
        delegatorId,
        delegateeId: data.delegateeId,
        roleId: data.roleId,
        permissions: data.permissions || [],
        validFrom: new Date(),
        validUntil: new Date(data.validUntil),
        reason: data.reason,
        isActive: true,
      },
    });

    await this.audit.log({
      action: 'authz.delegation.create',
      resource: 'AuthorityDelegation',
      resourceId: delegation.id,
      actorId: delegatorId,
      organizationId,
      schoolId: data.schoolId,
      severity: AuditSeverity.MEDIUM,
      metadata: { delegateeId: data.delegateeId, reason: data.reason },
    });

    return delegation;
  }

  async revokeDelegation(organizationId: string, delegationId: string, actorId: string) {
    const delegation = await this.db.authorityDelegation.findFirst({
      where: { id: delegationId, organizationId },
    });
    if (!delegation) throw new NotFoundException('Delegation not found');

    const updated = await this.db.authorityDelegation.update({
      where: { id: delegationId },
      data: { isActive: false },
    });

    await this.audit.log({
      action: 'authz.delegation.revoke',
      resource: 'AuthorityDelegation',
      resourceId: delegationId,
      actorId,
      organizationId,
      schoolId: delegation.schoolId || undefined,
    });

    return updated;
  }

  async getDelegations(organizationId: string, schoolId?: string) {
    return this.db.authorityDelegation.findMany({
      where: {
        organizationId,
        ...(schoolId ? { schoolId } : {}),
      },
      include: {
        delegator: { select: { id: true, email: true, firstName: true, lastName: true } },
        delegatee: { select: { id: true, email: true, firstName: true, lastName: true } },
        role: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
