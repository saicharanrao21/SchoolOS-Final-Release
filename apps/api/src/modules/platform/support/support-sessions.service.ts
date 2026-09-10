import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';

const DEFAULT_DURATION_MINUTES = 30;
const MAX_DURATION_MINUTES = 120;

@Injectable()
export class SupportSessionsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
    private readonly jwt: JwtService,
  ) {}

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private clampDuration(value?: number) {
    const minutes = Number(value ?? DEFAULT_DURATION_MINUTES);
    if (!Number.isFinite(minutes) || minutes < 5 || minutes > MAX_DURATION_MINUTES) {
      throw new BadRequestException(`durationMinutes must be between 5 and ${MAX_DURATION_MINUTES}`);
    }
    return Math.floor(minutes);
  }

  async createSession(
    organizationId: string,
    targetUserId: string,
    reason: string,
    actorUserId: string,
    durationMinutes?: number,
  ) {
    const normalizedReason = reason?.trim();
    if (!normalizedReason || normalizedReason.length < 5) {
      throw new BadRequestException('A meaningful support reason is required');
    }

    const duration = this.clampDuration(durationMinutes);
    const target = await this.db.user.findFirst({
      where: { id: targetUserId, organizationId, status: 'ACTIVE' },
      include: {
        roles: {
          include: {
            role: {
              include: { permissions: { include: { permission: true } } },
            },
          },
        },
      },
    });

    if (!target) {
      throw new NotFoundException('Active target user was not found in this tenant');
    }

    const rawToken = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + duration * 60 * 1000);

    const session = await this.db.platformSupportSession.create({
      data: {
        sessionToken: this.hashToken(rawToken),
        organizationId,
        actorUserId,
        targetUserId,
        reason: normalizedReason,
        expiresAt,
        isActive: true,
      },
      include: {
        organization: { select: { id: true, name: true, slug: true } },
        targetUser: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });

    await this.audit.log({
      action: 'platform.support_session.created',
      resource: 'PlatformSupportSession',
      resourceId: session.id,
      actorId: actorUserId,
      organizationId,
      metadata: {
        targetUserId,
        reason: normalizedReason,
        durationMinutes: duration,
        expiresAt,
      },
    });

    return {
      id: session.id,
      organization: session.organization,
      targetUser: session.targetUser,
      reason: session.reason,
      expiresAt: session.expiresAt,
      supportToken: rawToken,
      warning: 'Store this support token securely. It is shown only once.',
    };
  }

  async exchangeToken(rawToken: string) {
    if (!rawToken || rawToken.length < 40) {
      throw new UnauthorizedException('Invalid support token');
    }

    const session = await this.db.platformSupportSession.findUnique({
      where: { sessionToken: this.hashToken(rawToken) },
      include: {
        targetUser: {
          include: {
            roles: {
              include: {
                role: {
                  include: { permissions: { include: { permission: true } } },
                },
              },
            },
          },
        },
      },
    });

    if (!session || !session.isActive || session.endedAt || session.expiresAt <= new Date()) {
      throw new UnauthorizedException('Support session is invalid or expired');
    }

    if (session.targetUser.status !== 'ACTIVE' || session.targetUser.organizationId !== session.organizationId) {
      throw new ForbiddenException('Target user is no longer eligible for support access');
    }

    const roles = session.targetUser.roles.map((ur: any) => ur.role.name);
    const permissions = session.targetUser.roles.flatMap((ur: any) =>
      ur.role.permissions.map((rp: any) => rp.permission.name),
    );

    const remainingSeconds = Math.max(60, Math.floor((session.expiresAt.getTime() - Date.now()) / 1000));
    const accessToken = this.jwt.sign({
      sub: session.targetUser.id,
      email: session.targetUser.email,
      org: session.organizationId,
      roles,
      permissions,
      impersonation: true,
      impersonationSessionId: session.id,
      impersonatorUserId: session.actorUserId,
    }, { expiresIn: remainingSeconds });

    await this.audit.log({
      action: 'platform.support_session.exchanged',
      resource: 'PlatformSupportSession',
      resourceId: session.id,
      actorId: session.actorUserId,
      organizationId: session.organizationId,
      metadata: { targetUserId: session.targetUserId },
    });

    return {
      access_token: accessToken,
      expires_at: session.expiresAt,
      impersonation: true,
      impersonation_session_id: session.id,
      target_user_id: session.targetUserId,
    };
  }

  async endSession(sessionId: string, actorUserId: string) {
    const session = await this.db.platformSupportSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Support session not found');
    if (session.actorUserId !== actorUserId) {
      throw new ForbiddenException('Only the initiating superadmin can end this support session');
    }

    if (!session.isActive) return { success: true, alreadyEnded: true, endedAt: session.endedAt };

    const endedAt = new Date();
    await this.db.platformSupportSession.update({
      where: { id: sessionId },
      data: { isActive: false, endedAt },
    });

    await this.audit.log({
      action: 'platform.support_session.ended',
      resource: 'PlatformSupportSession',
      resourceId: session.id,
      actorId: actorUserId,
      organizationId: session.organizationId,
    });

    return { success: true, alreadyEnded: false, endedAt };
  }

  async listActiveSessions(actorUserId: string) {
    return this.db.platformSupportSession.findMany({
      where: { actorUserId, isActive: true, expiresAt: { gt: new Date() } },
      include: {
        organization: { select: { id: true, name: true, slug: true } },
        targetUser: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
      orderBy: { startedAt: 'desc' },
    });
  }
}
