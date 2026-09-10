import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuditModule } from '../audit/audit.module';
import { AuthorizationService } from './policy/authorization.service';
import { DelegationService } from './policy/delegation.service';
import { PolicyGuard } from './guards/policy.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { AuthorizationAdminController } from './policy/authorization-admin.controller';

@Module({
  imports: [
    PassportModule,
    AuditModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRATION') || '24h' },
      }),
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    AuthorizationService,
    DelegationService,
    PolicyGuard,
    PermissionsGuard,
  ],
  controllers: [AuthController, AuthorizationAdminController],
  exports: [AuthService, AuthorizationService, DelegationService, PolicyGuard, PermissionsGuard],
})
export class AuthModule {}
