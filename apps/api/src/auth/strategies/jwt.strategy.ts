import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../database/database.service';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService, private readonly db: DatabaseService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    if (payload.impersonation === true) {
      if (!payload.impersonationSessionId || !payload.impersonatorUserId) {
        throw new UnauthorizedException('Invalid impersonation token');
      }
      const session = await this.db.platformSupportSession.findUnique({
        where: { id: payload.impersonationSessionId },
        select: { actorUserId: true, targetUserId: true, organizationId: true, isActive: true, endedAt: true, expiresAt: true },
      });
      if (!session || !session.isActive || session.endedAt || session.expiresAt <= new Date() ||
          session.actorUserId !== payload.impersonatorUserId || session.targetUserId !== payload.sub ||
          session.organizationId !== payload.org) {
        throw new UnauthorizedException('Impersonation session is no longer active');
      }
    }

    return {
      id: payload.sub,
      email: payload.email,
      org: payload.org,
      roles: payload.roles,
      permissions: payload.permissions,
      impersonation: payload.impersonation === true,
      impersonationSessionId: payload.impersonationSessionId,
      impersonatorUserId: payload.impersonatorUserId,
    };
  }
}
