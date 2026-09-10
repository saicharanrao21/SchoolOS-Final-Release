import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { DEFAULT_ROLE_PERMISSIONS, PERMISSION_REGISTRY_METADATA } from '../permissions/permission.registry';

export interface EffectivePermissionContext {
  userId: string;
  organizationId: string;
  schoolId?: string;
  campusId?: string;
  academicYearId?: string;
}

export interface AccessPreviewNode {
  type: 'MEMBERSHIP' | 'DELEGATION' | 'SYSTEM_ROLE';
  roleName?: string;
  schoolId?: string | null;
  campusId?: string | null;
  permissionsGranted: string[];
  validUntil?: Date | null;
  delegatorName?: string;
  reason?: string;
}

export interface AccessPreviewResult {
  userId: string;
  userEmail: string;
  organizationId: string;
  effectivePermissions: string[];
  resolutionTree: AccessPreviewNode[];
}

@Injectable()
export class AuthorizationService {
  private readonly logger = new Logger(AuthorizationService.name);

  constructor(private readonly db: DatabaseService) {}

  async resolveEffectivePermissions(ctx: EffectivePermissionContext): Promise<Set<string>> {
    const { userId, organizationId, schoolId, campusId } = ctx;

    const user = await this.db.user.findFirst({
      where: { id: userId, organizationId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
        memberships: {
          where: { isActive: true },
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) return new Set();

    const permissions = new Set<string>();

    // 1. Direct User Roles (System & Org level)
    for (const ur of user.roles) {
      const roleName = ur.role.name;
      // Default system permissions fallback
      const defaultPerms = DEFAULT_ROLE_PERMISSIONS[roleName] || [];
      defaultPerms.forEach((p) => permissions.add(p));

      // DB-assigned permissions
      for (const rp of ur.role.permissions) {
        permissions.add(rp.permission.name);
      }
    }

    // 2. Multi-Tenant School/Campus Memberships
    for (const m of user.memberships) {
      if (m.organizationId !== organizationId) continue;
      if (schoolId && m.schoolId && m.schoolId !== schoolId) continue;
      if (campusId && m.campusId && m.campusId !== campusId) continue;

      const defaultPerms = DEFAULT_ROLE_PERMISSIONS[m.role.name] || [];
      defaultPerms.forEach((p) => permissions.add(p));

      for (const rp of m.role.permissions) {
        permissions.add(rp.permission.name);
      }
    }

    // 3. Delegated Authority Resolution
    const now = new Date();
    const delegations = await this.db.authorityDelegation.findMany({
      where: {
        organizationId,
        delegateeId: userId,
        isActive: true,
        validFrom: { lte: now },
        validUntil: { gte: now },
        ...(schoolId ? { OR: [{ schoolId: null }, { schoolId }] } : {}),
      },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    });

    for (const d of delegations) {
      if (d.role) {
        const defaultPerms = DEFAULT_ROLE_PERMISSIONS[d.role.name] || [];
        defaultPerms.forEach((p) => permissions.add(p));
        for (const rp of d.role.permissions) {
          permissions.add(rp.permission.name);
        }
      }
      if (Array.isArray(d.permissions)) {
        d.permissions.forEach((p) => permissions.add(p));
      }
    }

    return permissions;
  }

  async hasPermission(ctx: EffectivePermissionContext, permissionKey: string): Promise<boolean> {
    const effective = await this.resolveEffectivePermissions(ctx);
    if (effective.has(permissionKey)) return true;

    // SuperAdmin wildcard
    const user = await this.db.user.findFirst({
      where: { id: ctx.userId, organizationId: ctx.organizationId },
      include: { roles: { include: { role: true } } },
    });

    return user?.roles.some((r) => r.role.name === 'SUPER_ADMIN') || false;
  }

  async canAccessScope(
    userId: string,
    organizationId: string,
    schoolId?: string,
    campusId?: string,
  ): Promise<boolean> {
    const user = await this.db.user.findFirst({
      where: { id: userId, organizationId },
      include: { memberships: { where: { isActive: true } }, roles: { include: { role: true } } },
    });

    if (!user) return false;

    // SuperAdmin access
    if (user.roles.some((r) => r.role.name === 'SUPER_ADMIN')) return true;

    if (!schoolId) return true;

    const hasSchoolMembership = user.memberships.some(
      (m) => (!m.schoolId || m.schoolId === schoolId) && (!campusId || !m.campusId || m.campusId === campusId),
    );

    if (hasSchoolMembership) return true;

    // Check if user is an employee/student belonging to that school directly
    const school = await this.db.school.findFirst({
      where: { id: schoolId, organizationId },
    });

    return !!school;
  }

  async getAccessPreview(targetUserId: string, organizationId: string): Promise<AccessPreviewResult> {
    const targetUser = await this.db.user.findFirst({
      where: { id: targetUserId, organizationId },
      include: {
        roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
        memberships: {
          where: { isActive: true },
          include: { school: true, campus: true, role: { include: { permissions: { include: { permission: true } } } } },
        },
      },
    });

    if (!targetUser) throw new NotFoundException('Target user not found');

    const resolutionTree: AccessPreviewNode[] = [];
    const effectiveSet = new Set<string>();

    // Direct roles
    for (const ur of targetUser.roles) {
      const perms = [
        ...(DEFAULT_ROLE_PERMISSIONS[ur.role.name] || []),
        ...ur.role.permissions.map((rp) => rp.permission.name),
      ];
      perms.forEach((p) => effectiveSet.add(p));
      resolutionTree.push({
        type: 'SYSTEM_ROLE',
        roleName: ur.role.name,
        permissionsGranted: perms,
      });
    }

    // Memberships
    for (const m of targetUser.memberships) {
      const perms = [
        ...(DEFAULT_ROLE_PERMISSIONS[m.role.name] || []),
        ...m.role.permissions.map((rp) => rp.permission.name),
      ];
      perms.forEach((p) => effectiveSet.add(p));
      resolutionTree.push({
        type: 'MEMBERSHIP',
        roleName: m.role.name,
        schoolId: m.schoolId,
        campusId: m.campusId,
        permissionsGranted: perms,
        validUntil: m.validUntil,
      });
    }

    // Delegations
    const now = new Date();
    const delegations = await this.db.authorityDelegation.findMany({
      where: { organizationId, delegateeId: targetUserId, isActive: true, validFrom: { lte: now }, validUntil: { gte: now } },
      include: { delegator: true, role: { include: { permissions: { include: { permission: true } } } } },
    });

    for (const d of delegations) {
      const perms = [
        ...(d.role ? DEFAULT_ROLE_PERMISSIONS[d.role.name] || [] : []),
        ...(d.role ? d.role.permissions.map((rp) => rp.permission.name) : []),
        ...(d.permissions || []),
      ];
      perms.forEach((p) => effectiveSet.add(p));
      resolutionTree.push({
        type: 'DELEGATION',
        roleName: d.role?.name,
        schoolId: d.schoolId,
        campusId: d.campusId,
        permissionsGranted: perms,
        validUntil: d.validUntil,
        delegatorName: `${d.delegator.firstName} ${d.delegator.lastName}`,
        reason: d.reason,
      });
    }

    return {
      userId: targetUserId,
      userEmail: targetUser.email,
      organizationId,
      effectivePermissions: Array.from(effectiveSet),
      resolutionTree,
    };
  }
}
