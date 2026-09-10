export type ScopeType =
  | 'GLOBAL'
  | 'ORGANIZATION'
  | 'SCHOOL'
  | 'CAMPUS'
  | 'ACADEMIC_SESSION'
  | 'OWN'
  | 'RECORD';

export interface PermissionDefinition {
  key: string;
  domain: string;
  resource: string;
  action: string;
  description: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  sensitive?: boolean;
  scopeType: ScopeType;
}

export const PERMISSIONS = {
  // Students
  STUDENTS_READ: 'students.read',
  STUDENTS_MANAGE: 'students.manage',
  STUDENTS_DELETE: 'students.delete',
  STUDENTS_PROMOTE: 'students.promote',

  // Attendance
  ATTENDANCE_READ: 'attendance.read',
  ATTENDANCE_MANAGE: 'attendance.manage',
  ATTENDANCE_APPROVE: 'attendance.approve',

  // Academics & LMS
  ACADEMICS_READ: 'academics.read',
  ACADEMICS_MANAGE: 'academics.manage',
  LMS_READ: 'lms.read',
  LMS_MANAGE: 'lms.manage',

  // Examinations
  EXAMS_READ: 'exams.read',
  EXAMS_MANAGE: 'exams.manage',
  EXAMS_PUBLISH: 'exams.publish',

  // Fees & Finance
  FINANCE_READ: 'finance.read',
  FINANCE_COLLECT: 'finance.collect',
  FINANCE_REFUND: 'finance.refund',
  FINANCE_APPROVE: 'finance.approve',
  ACCOUNTING_READ: 'accounting.read',
  ACCOUNTING_MANAGE: 'accounting.manage',

  // HR & Payroll
  HR_READ: 'hr.read',
  HR_MANAGE: 'hr.manage',
  PAYROLL_READ: 'payroll.read',
  PAYROLL_PROCESS: 'payroll.process',

  // Operations
  TRANSPORT_READ: 'transport.read',
  TRANSPORT_MANAGE: 'transport.manage',
  LIBRARY_READ: 'library.read',
  LIBRARY_MANAGE: 'library.manage',
  HOSTEL_READ: 'hostel.read',
  HOSTEL_MANAGE: 'hostel.manage',
  INVENTORY_READ: 'inventory.read',
  PROCUREMENT_READ: 'procurement.read',
  PROCUREMENT_MANAGE: 'procurement.manage',
  ASSETS_READ: 'assets.read',
  SECURITY_READ: 'security.read',
  SECURITY_MANAGE: 'security.manage',
  HEALTH_READ: 'health.read',

  // Workflows & Communications
  WORKFLOW_READ: 'workflow.read',
  WORKFLOW_APPROVE: 'workflow.approve',
  COMMUNICATIONS_READ: 'communications.read',
  COMMUNICATIONS_SEND: 'communications.send',
  NOTIFICATIONS_MANAGE: 'notifications.manage',
  DMS_READ: 'dms.read',
  CERTIFICATES_READ: 'certificates.read',

  // Settings & System
  SETTINGS_READ: 'settings.read',
  SETTINGS_MANAGE: 'settings.manage',
  PLATFORM_READ: 'platform.read',
  PLATFORM_MANAGE: 'platform.manage',
  PLATFORM_IMPERSONATE: 'platform.impersonate',
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const SYSTEM_ROLES = {
  PLATFORM_SUPER_ADMIN: 'SUPER_ADMIN',
  PLATFORM_SUPPORT: 'PLATFORM_SUPPORT',
  ORGANIZATION_ADMIN: 'ORGANIZATION_ADMIN',
  SCHOOL_ADMIN: 'SCHOOL_ADMIN',
  PRINCIPAL: 'PRINCIPAL',
  VICE_PRINCIPAL: 'VICE_PRINCIPAL',
  TEACHER: 'TEACHER',
  CLASS_TEACHER: 'CLASS_TEACHER',
  ACCOUNTANT: 'ACCOUNTANT',
  FINANCE_MANAGER: 'FINANCE_MANAGER',
  HR_MANAGER: 'HR_MANAGER',
  TRANSPORT_MANAGER: 'TRANSPORT_MANAGER',
  TRANSPORT_OPERATOR: 'TRANSPORT_OPERATOR',
  LIBRARIAN: 'LIBRARIAN',
  HOSTEL_WARDEN: 'HOSTEL_WARDEN',
  SECURITY_OFFICER: 'SECURITY_OFFICER',
  PARENT: 'PARENT',
  STUDENT: 'STUDENT',
} as const;
