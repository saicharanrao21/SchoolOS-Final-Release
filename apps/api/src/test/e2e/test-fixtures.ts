import { SubscriptionStatus, SaaSInvoiceStatus, SaaSPaymentStatus, SaaSPaymentProvider, SyncMutationStatus, ExpenseClaimStatus, InternalVendorStatus, LegalMatterStatus, CompanyContractStatus } from '@prisma/client';

export class TestFixtures {
  static createMockTenantA() {
    return {
      id: 'org-tenant-a',
      name: 'Greenwood Education Trust',
      code: 'GREENWOOD',
    };
  }

  static createMockTenantB() {
    return {
      id: 'org-tenant-b',
      name: 'Oakridge Academy Network',
      code: 'OAKRIDGE',
    };
  }

  static createMockSchoolA() {
    return {
      id: 'school-a1',
      organizationId: 'org-tenant-a',
      name: 'Greenwood High Main Campus',
      code: 'GWH-MAIN',
    };
  }

  static createMockSchoolB() {
    return {
      id: 'school-b1',
      organizationId: 'org-tenant-b',
      name: 'Oakridge International School',
      code: 'OAK-INT',
    };
  }

  static createMockUsers() {
    return {
      superAdmin: {
        id: 'usr-superadmin',
        email: 'superadmin@schoolos.com',
        roles: ['SUPER_ADMIN'],
        permissions: ['*'],
      },
      tenantAdminA: {
        id: 'usr-admin-a',
        organizationId: 'org-tenant-a',
        email: 'admin@greenwood.com',
        roles: ['ADMIN'],
        permissions: ['student.manage', 'finance.manage', 'billing.subscriptions.manage'],
      },
      teacherA: {
        id: 'usr-teacher-a',
        organizationId: 'org-tenant-a',
        email: 'teacher@greenwood.com',
        roles: ['TEACHER'],
        permissions: ['teacher.classes.read', 'attendance.mark', 'exams.marks.entry'],
      },
      parentA: {
        id: 'usr-parent-a',
        organizationId: 'org-tenant-a',
        email: 'parent.a@gmail.com',
        roles: ['PARENT'],
        permissions: ['parent.academics.read', 'parent.fees.read', 'student.reportcard.read'],
      },
      parentB: {
        id: 'usr-parent-b',
        organizationId: 'org-tenant-a',
        email: 'parent.b@gmail.com',
        roles: ['PARENT'],
        permissions: ['parent.academics.read', 'parent.fees.read', 'student.reportcard.read'],
      },
      studentA: {
        id: 'usr-student-a',
        organizationId: 'org-tenant-a',
        email: 'student.a@greenwood.com',
        roles: ['STUDENT'],
        permissions: ['student.academics.read', 'student.reportcard.read'],
      },
    };
  }

  static createMockStudentWithGuardian() {
    return {
      student: {
        id: 'stud-1',
        userId: 'usr-student-a',
        schoolId: 'school-a1',
        firstName: 'John',
        lastName: 'Doe',
        admissionNumber: 'ADM-2026-001',
      },
      guardian: {
        id: 'guard-1',
        userId: 'usr-parent-a',
        firstName: 'Robert',
        lastName: 'Doe',
      },
      relationship: {
        id: 'rel-1',
        studentId: 'stud-1',
        guardianId: 'guard-1',
        relationshipType: 'FATHER',
        isPrimary: true,
      },
    };
  }
}
