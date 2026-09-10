import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { AuthorizationService } from '../policy/authorization.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authzService?: AuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) return false;

    // Super Admin direct bypass
    if (user.roles?.includes('SUPER_ADMIN')) {
      return true;
    }

    const schoolId = req.query?.schoolId || req.body?.schoolId || req.params?.schoolId;
    const campusId = req.query?.campusId || req.body?.campusId || req.params?.campusId;
    const academicYearId = req.query?.academicYearId || req.body?.academicYearId;

    if (this.authzService) {
      // Single Authoritative Evaluation Engine
      const result = await this.authzService.authorize({
        userId: user.id,
        organizationId: user.org,
        schoolId,
        campusId,
        academicYearId,
      });

      if (!result.allowed) {
        throw new ForbiddenException(result.reason || 'Access denied');
      }

      // Check each required permission against DB-resolved effective permissions
      for (const perm of requiredPermissions) {
        const permResult = await this.authzService.authorize({
          userId: user.id,
          organizationId: user.org,
          permissionKey: perm,
          schoolId,
          campusId,
          academicYearId,
        });

        if (!permResult.allowed) {
          throw new ForbiddenException(permResult.reason || `Permission '${perm}' denied for target scope`);
        }
      }

      return true;
    }

    // Fallback array check if authzService is omitted in unit test harness
    return requiredPermissions.every((permission) => user.permissions?.includes(permission));
  }
}
