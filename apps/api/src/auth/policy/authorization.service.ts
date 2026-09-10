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

export interface AuthorizeOptions {
  userId: string;
  organizationId: string;
  permissionKey?: string;
  schoolId?: string;
  campusId?: string;
  academicYearId?: string;
  resourceOwnerUserId?: string;
}

export interface AuthorizeResult {
  allowed: boolean;
  reason?: string;
  matchedPermission?: string;
  matchedRoles?: string[];
  effectivePermissions: string[];
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

    if (!user || user.status !== 'ACTIVE') return new Set();

    const permissions = new Set<string>();

    // 1. Platform SuperAdmin & Org-Wide Direct Roles
    for (const ur of user.roles) {
      const roleName = ur.role.name;
      const defaultPerms = DEFAULT_ROLE_PERMISSIONS[roleName] || [];
      defaultPerms.forEach((p) => permissions.add(p));

      for (const rp of ur.role.permissions) {
        permissions.add(rp.permission.name);
      }
    }

    // 2. Explicit Multi-Tenant School/Campus Memberships
    for (const m of user.memberships) {
      if (m.organizationId !== organizationId) continue;

      // School Scope Check
      if (schoolId && m.schoolId && m.schoolId !== schoolId) continue;

      // Campus Scope Check
      if (campusId && m.campusId && m.campusId !== campusId) continue;

      // Academic Session Check if specified
      if (ctx.academicYearId && m.academicYearId && m.academicYearId !== ctx.academicYearId) continue;

      // Expiry Check
      if (m.validUntil && m.validUntil < new Date()) continue;

      const defaultPerms = DEFAULT_ROLE_PERMISSIONS[m.role.name] || [];
      defaultPerms.forEach((p) => permissions.add(p));

      for (const rp of m.role.permissions) {
        permissions.add(rp.permission.name);
      }
    }

    // 3. Authority Delegations (Subset-Enforced & Non-Transitive)
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
      if (d.campusId && campusId && d.campusId !== campusId) continue;

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

  async authorize(options: AuthorizeOptions): Promise<AuthorizeResult> {
    const { userId, organizationId, permissionKey, schoolId, campusId, academicYearId, resourceOwnerUserId } = options;

    const user = await this.db.user.findFirst({
      where: { id: userId, organizationId },
      include: { roles: { include: { role: true } } },
    });

    if (!user || user.status !== 'ACTIVE') {
      return { allowed: false, reason: 'User unauthenticated or inactive', effectivePermissions: [] };
    }

    const roles = user.roles.map((r) => r.role.name);

    // Platform SuperAdmin explicit wildcard
    if (roles.includes('SUPER_ADMIN')) {
      return {
        allowed: true,
        reason: 'PLATFORM_SUPER_ADMIN Wildcard',
        matchedRoles: ['SUPER_ADMIN'],
        effectivePermissions: Array.from(Object.values(DEFAULT_ROLE_PERMISSIONS['SUPER_ADMIN'] || [])),
      };
    }

    // Self-Ownership check
    if (resourceOwnerUserId && resourceOwnerUserId === userId) {
      return {
        allowed: true,
        reason: 'RESOURCE_OWNER',
        matchedRoles: roles,
        effectivePermissions: ['own.read', 'own.write'],
      };
    }

    // Scope Access Validation
    const canAccess = await this.canAccessScope(userId, organizationId, schoolId, campusId, academicYearId);
    if (!canAccess) {
      return { allowed: false, reason: 'Target school/campus scope unauthorized', effectivePermissions: [] };
    }

    const effective = await this.resolveEffectivePermissions({
      userId,
      organizationId,
      schoolId,
      campusId,
      academicYearId,
    });

    if (permissionKey && !effective.has(permissionKey)) {
      return {
        allowed: false,
        reason: `Missing required permission '${permissionKey}'`,
        effectivePermissions: Array.from(effective),
      };
    }

    return {
      allowed: true,
      matchedPermission: permissionKey,
      matchedRoles: roles,
      effectivePermissions: Array.from(effective),
    };
  }

  async hasPermission(ctx: EffectivePermissionContext, permissionKey: string): Promise<boolean> {
    const res = await this.authorize({
      userId: ctx.userId,
      organizationId: ctx.organizationId,
      permissionKey,
      schoolId: ctx.schoolId,
      campusId: ctx.campusId,
      academicYearId: ctx.academicYearId,
    });
    return res.allowed;
  }

  async canAccessScope(
    userId: string,
    organizationId: string,
    schoolId?: string,
    campusId?: string,
    academicYearId?: string,
  ): Promise<boolean> {
    const user = await this.db.user.findFirst({
      where: { id: userId, organizationId },
      include: {
        memberships: { where: { isActive: true } },
        roles: { include: { role: true } },
      },
    });

    if (!user || user.status !== 'ACTIVE') return false;

    // SuperAdmin access
    if (user.roles.some((r) => r.role.name === 'SUPER_ADMIN')) return true;

    if (!schoolId) {
      // Organization-wide request check
      return user.roles.some((r) => ['ORGANIZATION_ADMIN', 'ORGANIZATION_OWNER'].includes(r.role.name)) ||
        user.memberships.some((m) => m.schoolId === null);
    }

    // Explicit Membership Check (REMOVED: "School exists in same org => access granted" leak)
    const hasExplicitMembership = user.memberships.some((m) => {
      if (m.schoolId && m.schoolId !== schoolId) return false;
      if (campusId && m.campusId && m.campusId !== campusId) return false;
      if (academicYearId && m.academicYearId && m.academicYearId !== academicYearId) return false;
      if (m.validUntil && m.validUntil < new Date()) return false;
      return true;
    });

    if (hasExplicitMembership) return true;

    // Check Active Non-Transitive Delegations
    const now = new Date();
    const delegation = await this.db.authorityDelegation.findFirst({
      where: {
        organizationId,
        delegateeId: userId,
        isActive: true,
        validFrom: { lte: now },
        validUntil: { gte: now },
        OR: [{ schoolId: null }, { schoolId }],
      },
    });

    return !!delegation;
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
