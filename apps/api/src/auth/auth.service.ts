import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import { AuditService } from '../audit/audit.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { AuditSeverity } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.db.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (user && (await bcrypt.compare(pass, user.password))) {
      if (user.status !== 'ACTIVE') {
        throw new UnauthorizedException('User account is not active');
      }
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any, ipAddress?: string, userAgent?: string) {
    const payload = {
      sub: user.id,
      email: user.email,
      org: user.organizationId,
      roles: user.roles?.map((ur: any) => ur.role.name) || [],
      permissions: user.roles?.flatMap((ur: any) =>
        ur.role.permissions.map((rp: any) => rp.permission.name)
      ) || [],
    };

    const accessToken = this.jwtService.sign(payload);

    // Create Session and Refresh Token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const session = await this.db.session.create({
      data: {
        userId: user.id,
        ipAddress,
        userAgent,
        expiresAt,
      },
    });

    const refreshToken = await this.generateRefreshToken(session.id);

    await this.db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await this.audit.log({
      action: 'auth.login',
      resource: 'User',
      resourceId: user.id,
      actorId: user.id,
      organizationId: user.organizationId,
      ipAddress,
      userAgent,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        organizationId: user.organizationId,
        roles: payload.roles,
      },
    };
  }

  private async generateRefreshToken(sessionId: string): Promise<string> {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.db.refreshToken.create({
      data: {
        token: hashedToken,
        sessionId,
        expiresAt,
      },
    });

    return rawToken;
  }

  async refresh(rawRefreshToken: string) {
    if (!rawRefreshToken || typeof rawRefreshToken !== 'string') {
      throw new UnauthorizedException('Invalid refresh token payload');
    }

    const hashedToken = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

    // Try hashed lookup first, then fallback to raw token for backward compatibility
    let storedToken = await this.db.refreshToken.findUnique({
      where: { token: hashedToken },
      include: {
        session: {
          include: {
            user: {
              include: {
                roles: {
                  include: {
                    role: {
                      include: {
                        permissions: {
                          include: {
                            permission: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!storedToken) {
      storedToken = await this.db.refreshToken.findUnique({
        where: { token: rawRefreshToken },
        include: {
          session: {
            include: {
              user: {
                include: {
                  roles: {
                    include: {
                      role: {
                        include: {
                          permissions: {
                            include: {
                              permission: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
    }

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Replay Detection & Token Abuse Protection
    if (storedToken.isUsed || storedToken.isRevoked || storedToken.session.isRevoked) {
      this.logger.warn(`Security Event: Replay attempt detected on refresh token for user ${storedToken.session.userId}`);

      // Revoke all session tokens & invalidate the session
      await this.db.$transaction([
        this.db.session.update({
          where: { id: storedToken.sessionId },
          data: { isRevoked: true },
        }),
        this.db.refreshToken.updateMany({
          where: { sessionId: storedToken.sessionId },
          data: { isRevoked: true },
        }),
      ]);

      await this.audit.log({
        action: 'auth.refresh.replay_detected',
        resource: 'Session',
        resourceId: storedToken.sessionId,
        actorId: storedToken.session.userId,
        organizationId: storedToken.session.user.organizationId,
        severity: AuditSeverity.HIGH,
        metadata: { reason: 'Refresh token reuse attempt' },
      });

      throw new UnauthorizedException('Security Violation: Refresh token reuse detected. Session revoked.');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    if (storedToken.session.user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is suspended or inactive');
    }

    // Mark current token as used
    await this.db.refreshToken.update({
      where: { id: storedToken.id },
      data: { isUsed: true },
    });

    // Generate new token pair
    return this.login(
      storedToken.session.user,
      storedToken.session.ipAddress ?? undefined,
      storedToken.session.userAgent ?? undefined,
    );
  }

  async logout(rawRefreshToken: string) {
    if (!rawRefreshToken) return;

    const hashedToken = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

    let storedToken = await this.db.refreshToken.findUnique({
      where: { token: hashedToken },
    });

    if (!storedToken) {
      storedToken = await this.db.refreshToken.findUnique({
        where: { token: rawRefreshToken },
      });
    }

    if (storedToken) {
      await this.db.$transaction([
        this.db.session.update({
          where: { id: storedToken.sessionId },
          data: { isRevoked: true },
        }),
        this.db.refreshToken.updateMany({
          where: { sessionId: storedToken.sessionId },
          data: { isRevoked: true },
        }),
      ]);
    }
  }
}
