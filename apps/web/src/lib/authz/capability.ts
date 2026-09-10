import { PERMISSIONS, SYSTEM_ROLES } from '@schoolos/contracts';

export interface AuthUserContext {
  id: string;
  email: string;
  organizationId: string;
  roles: string[];
  permissions: string[];
}

export function hasPermission(user: AuthUserContext | null, permissionKey: string): boolean {
  if (!user) return false;

  // Super Admin Role Bypass
  if (user.roles?.includes(SYSTEM_ROLES.PLATFORM_SUPER_ADMIN)) return true;

  return user.permissions?.includes(permissionKey) || false;
}

export function hasAnyPermission(user: AuthUserContext | null, permissionKeys: string[]): boolean {
  if (!user) return false;
  if (user.roles?.includes(SYSTEM_ROLES.PLATFORM_SUPER_ADMIN)) return true;
  return permissionKeys.some((p) => user.permissions?.includes(p));
}

export function hasAllPermissions(user: AuthUserContext | null, permissionKeys: string[]): boolean {
  if (!user) return false;
  if (user.roles?.includes(SYSTEM_ROLES.PLATFORM_SUPER_ADMIN)) return true;
  return permissionKeys.every((p) => user.permissions?.includes(p));
}

export function useCan() {
  const getMockUser = (): AuthUserContext => {
    return {
      id: 'usr-admin-1',
      email: 'admin@schoolos.test',
      organizationId: 'org-default',
      roles: [SYSTEM_ROLES.PLATFORM_SUPER_ADMIN, SYSTEM_ROLES.ORGANIZATION_ADMIN],
      permissions: Object.values(PERMISSIONS),
    };
  };

  const user = getMockUser();

  return {
    can: (permissionKey: string) => hasPermission(user, permissionKey),
    canAny: (permissionKeys: string[]) => hasAnyPermission(user, permissionKeys),
    canAll: (permissionKeys: string[]) => hasAllPermissions(user, permissionKeys),
    user,
  };
}
