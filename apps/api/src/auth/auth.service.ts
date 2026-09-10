import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
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
      roles: user.roles.map((ur: any) => ur.role.name),
      permissions: user.roles.flatMap((ur: any) =>
        ur.role.permissions.map((rp: any) => rp.permission.name)
      ),
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
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.db.refreshToken.create({
      data: {
        token,
        sessionId,
        expiresAt,
      },
    });

    return token;
  }

  async refresh(refreshToken: string) {
    const storedToken = await this.db.refreshToken.findUnique({
      where: { token: refreshToken },
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

    if (!storedToken || storedToken.isRevoked || storedToken.isUsed || storedToken.session.isRevoked) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // Mark current token as used
    await this.db.refreshToken.update({
      where: { id: storedToken.id },
      data: { isUsed: true },
    });

    // Generate new pair
    return this.login(
      storedToken.session.user,
      storedToken.session.ipAddress ?? undefined,
      storedToken.session.userAgent ?? undefined
    );
  }

  async logout(refreshToken: string) {
    const storedToken = await this.db.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (storedToken) {
      await this.db.session.update({
        where: { id: storedToken.sessionId },
        data: { isRevoked: true },
      });

      await this.db.refreshToken.updateMany({
        where: { sessionId: storedToken.sessionId },
        data: { isRevoked: true },
      });
    }
  }
}
