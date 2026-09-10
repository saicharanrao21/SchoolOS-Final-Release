import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { TenancyModule } from './tenancy/tenancy.module';
import { AuditModule } from './audit/audit.module';
import { IdentityModule } from './modules/identity/identity.module';
import { MasterDataModule } from './modules/master-data/master-data.module';
import { AcademicsModule } from './modules/academics/academics.module';
import { StudentsModule } from './modules/students/students.module';
import { GuardiansModule } from './modules/guardians/guardians.module';
import { AdmissionsModule } from './modules/admissions/admissions.module';
import { FinanceModule } from './modules/finance/finance.module';
import { AccountingModule } from './modules/accounting/accounting.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { LeaveModule } from './modules/leave/leave.module';
import { ExamsModule } from './modules/exams/exams.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TransportModule } from './modules/transport/transport.module';
import { ParentModule } from './modules/parent/parent.module';
import { TeacherModule } from './modules/teacher/teacher.module';
import { LibraryModule } from './modules/library/library.module';
import { HostelModule } from './modules/hostel/hostel.module';
import { EventsModule } from './modules/events/events.module';
import { PtmModule } from './modules/ptm/ptm.module';
import { HrModule } from './modules/hr/hr.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ProcurementModule } from './modules/procurement/procurement.module';
import { AssetsModule } from './modules/assets/assets.module';
import { SecurityModule } from './modules/security/security.module';
import { DmsModule } from './modules/dms/dms.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { DataExchangeModule } from './modules/data-exchange/data-exchange.module';
import { SearchModule } from './modules/search/search.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { BillingModule } from './modules/billing/billing.module';
import { InternalModule } from './modules/internal/internal.module';
import { PlatformModule } from './modules/platform/platform.module';
import { SyncModule } from './modules/sync/sync.module';
import { StudentHealthModule } from './modules/health/health.module';
import { StudentLifeModule } from './modules/student-life/student-life.module';
import { LmsModule } from './modules/lms/lms.module';
import { CommunicationsModule } from './modules/communications/communications.module';
import { BiometricModule } from './modules/biometric/biometric.module';
import { AiAssistantModule } from './modules/ai/ai.module';
import { CmsModule } from './modules/cms/cms.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    HealthModule,
    AuthModule,
    TenancyModule,
    AuditModule,
    IdentityModule,
    MasterDataModule,
    AcademicsModule,
    StudentsModule,
    GuardiansModule,
    AdmissionsModule,
    FinanceModule,
    AccountingModule,
    AttendanceModule,
    LeaveModule,
    ExamsModule,
    NotificationsModule,
    TransportModule,
    ParentModule,
    TeacherModule,
    LibraryModule,
    HostelModule,
    EventsModule,
    PtmModule,
    HrModule,
    PayrollModule,
    InventoryModule,
    ProcurementModule,
    AssetsModule,
    SecurityModule,
    DmsModule,
    CertificatesModule,
    DataExchangeModule,
    SearchModule,
    AnalyticsModule,
    WorkflowModule,
    BillingModule,
    InternalModule,
    PlatformModule,
    SyncModule,
    StudentHealthModule,
    StudentLifeModule,
    LmsModule,
    CommunicationsModule,
    BiometricModule,
    AiAssistantModule,
    CmsModule,
  ],
})
export class AppModule {}
