import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
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

    // Super Admin bypass
    if (user.roles?.includes('SUPER_ADMIN')) {
      return true;
    }

    const schoolId = req.query?.schoolId || req.body?.schoolId;

    if (this.authzService) {
      const effective = await this.authzService.resolveEffectivePermissions({
        userId: user.id,
        organizationId: user.org,
        schoolId,
      });

      return requiredPermissions.every((perm) => effective.has(perm));
    }

    // Fallback array check
    return requiredPermissions.every((permission) => user.permissions?.includes(permission));
  }
}
