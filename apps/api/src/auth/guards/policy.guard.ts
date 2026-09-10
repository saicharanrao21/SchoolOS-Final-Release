import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SCOPE_KEY } from '../decorators/scope.decorator';
import { AuthorizationService } from '../policy/authorization.service';

@Injectable()
export class PolicyGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authz: AuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredScope = this.reflector.getAllAndOverride<'ORGANIZATION' | 'SCHOOL' | 'CAMPUS'>(SCOPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredScope) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) return false;

    const schoolId = req.query?.schoolId || req.body?.schoolId || req.params?.schoolId;
    const campusId = req.query?.campusId || req.body?.campusId || req.params?.campusId;

    const canAccess = await this.authz.canAccessScope(
      user.id,
      user.org,
      schoolId,
      campusId,
    );

    if (!canAccess) {
      throw new ForbiddenException(`Access denied for ${requiredScope} scope in target school/campus`);
    }

    return true;
  }
}
