import { Module } from '@nestjs/common';
import { PlatformTenantsService } from './tenants/tenants.service';
import { PlatformTenantsController } from './tenants/tenants.controller';
import { PlatformFeatureFlagsService } from './feature-flags/feature-flags.service';
import { PlatformFeatureFlagsController } from './feature-flags/feature-flags.controller';
import { BillingModule } from '../billing/billing.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SupportSessionsService } from './support/support-sessions.service';
import { SupportSessionsController } from './support/support-sessions.controller';
import { PlatformAuditService } from './audit/platform-audit.service';
import { PlatformAuditController } from './audit/platform-audit.controller';

@Module({
  imports: [
    BillingModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRATION') || '24h' },
      }),
    }),
  ],
  controllers: [
    PlatformTenantsController,
    PlatformFeatureFlagsController,
    SupportSessionsController,
    PlatformAuditController,
  ],
  providers: [
    PlatformTenantsService,
    PlatformFeatureFlagsService,
    SupportSessionsService,
    PlatformAuditService,
  ],
  exports: [
    PlatformTenantsService,
    PlatformFeatureFlagsService,
    SupportSessionsService,
    PlatformAuditService,
  ],
})
export class PlatformModule {}
