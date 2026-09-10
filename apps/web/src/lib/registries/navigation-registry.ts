import {
  LayoutDashboard,
  Users,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  UserPlus,
  Wallet,
  Send,
  Bus,
  HeartPulse,
  Library,
  Home,
  Calendar,
  Briefcase,
  BarChart3,
  GitBranch,
  FolderTree,
  ShoppingCart,
  ShieldCheck,
  CreditCard,
  Settings,
  Landmark,
  Bell,
  History,
  ToggleRight,
  School,
  MapPin,
  Layers,
  LucideIcon,
} from 'lucide-react';

export interface NavChildItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
}

export interface NavDomainGroup {
  label: string;
  icon: LucideIcon;
  children?: NavChildItem[];
  href?: string;
  permission?: string;
}

export const ENTERPRISE_NAVIGATION_REGISTRY: NavDomainGroup[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/management/dashboard' },
  {
    label: 'Academics',
    icon: BookOpen,
    children: [
      { label: 'Timetables', href: '/management/academics/timetables', icon: Calendar, permission: 'academics.read' },
      { label: 'Curriculum', href: '/management/academics/curriculum', icon: Library, permission: 'academics.read' },
      { label: 'Homework', href: '/management/academics/homework', icon: BookOpen, permission: 'academics.read' },
    ],
  },
  {
    label: 'Digital LMS & CBT',
    icon: GraduationCap,
    children: [
      { label: 'LMS Dashboard', href: '/management/lms/dashboard', icon: LayoutDashboard, permission: 'lms.read' },
      { label: 'Courses & Content', href: '/management/lms/courses', icon: BookOpen, permission: 'lms.read' },
      { label: 'Live Classes', href: '/management/lms/live-classes', icon: GraduationCap, permission: 'lms.read' },
      { label: 'Quizzes & CBT Exams', href: '/management/lms/quizzes', icon: CheckCircle2, permission: 'lms.read' },
    ],
  },
  {
    label: 'Examinations',
    icon: GraduationCap,
    children: [
      { label: 'Dashboard', href: '/management/exams/dashboard', icon: LayoutDashboard, permission: 'exams.read' },
      { label: 'Exam List', href: '/management/exams/examinations', icon: Calendar, permission: 'exams.read' },
      { label: 'Marks Entry', href: '/management/exams/mark-entry', icon: BookOpen, permission: 'exams.manage' },
      { label: 'Result Sheets', href: '/management/exams/results', icon: ShieldCheck, permission: 'exams.read' },
      { label: 'Report Cards', href: '/management/exams/report-cards', icon: GraduationCap, permission: 'exams.read' },
    ],
  },
  {
    label: 'Attendance',
    icon: CheckCircle2,
    children: [
      { label: 'Dashboard', href: '/management/attendance/dashboard', icon: LayoutDashboard, permission: 'attendance.read' },
      { label: 'Mark Attendance', href: '/management/attendance/mark', icon: CheckCircle2, permission: 'attendance.manage' },
      { label: 'Corrections', href: '/management/attendance/corrections', icon: History, permission: 'attendance.manage' },
      { label: 'Attendance Intelligence', href: '/management/attendance/intelligence', icon: BarChart3, permission: 'attendance.read' },
    ],
  },
  {
    label: 'Admissions CRM',
    icon: UserPlus,
    children: [
      { label: 'Dashboard', href: '/management/admissions/dashboard', icon: LayoutDashboard, permission: 'admissions.read' },
      { label: 'Leads & Enquiries', href: '/management/admissions/enquiries', icon: Send, permission: 'admissions.read' },
      { label: 'Applications', href: '/management/admissions/applications', icon: UserPlus, permission: 'admissions.read' },
    ],
  },
  {
    label: 'Fees & Finance',
    icon: Wallet,
    children: [
      { label: 'Collection Control', href: '/management/finance/collection', icon: Wallet, permission: 'finance.read' },
      { label: 'Dashboard', href: '/management/finance/dashboard', icon: LayoutDashboard, permission: 'finance.read' },
      { label: 'Fee Structures', href: '/management/finance/fee-structures', icon: Layers, permission: 'finance.manage' },
      { label: 'Invoices', href: '/management/finance/invoices', icon: Wallet, permission: 'finance.read' },
      { label: 'Collect Fee', href: '/management/finance/collect', icon: Wallet, permission: 'finance.manage' },
    ],
  },
  {
    label: 'Communications',
    icon: Send,
    children: [
      { label: 'Dashboard', href: '/management/communications/dashboard', icon: LayoutDashboard, permission: 'communications.read' },
      { label: 'Inbox', href: '/management/communications/inbox', icon: Send, permission: 'communications.read' },
      { label: 'Templates', href: '/management/notifications/templates', icon: BookOpen, permission: 'notifications.manage' },
      { label: 'Gateways', href: '/management/notifications/gateways', icon: Settings, permission: 'notifications.manage' },
    ],
  },
  {
    label: 'Transport',
    icon: Bus,
    children: [
      { label: 'Dashboard', href: '/management/transport/dashboard', icon: LayoutDashboard, permission: 'transport.read' },
      { label: 'Routes', href: '/management/transport/routes', icon: MapPin, permission: 'transport.read' },
      { label: 'Maintenance', href: '/management/transport/maintenance', icon: Settings, permission: 'transport.manage' },
      { label: 'Safety & Incidents', href: '/management/transport/safety', icon: ShieldCheck, permission: 'transport.read' },
    ],
  },
  {
    label: 'Health & Wellbeing',
    icon: HeartPulse,
    children: [
      { label: 'Health Centre', href: '/management/health/dashboard', icon: HeartPulse, permission: 'health.read' },
    ],
  },
  {
    label: 'Student Life',
    icon: Users,
    children: [
      { label: 'Behavior & Discipline', href: '/management/student-life/dashboard', icon: ShieldCheck, permission: 'students.read' },
      { label: 'Counseling & Wellbeing', href: '/management/student-life/counseling', icon: HeartPulse, permission: 'students.read' },
    ],
  },
  {
    label: 'Library',
    icon: Library,
    children: [
      { label: 'Dashboard', href: '/management/library/dashboard', icon: LayoutDashboard, permission: 'library.read' },
      { label: 'Circulation', href: '/management/library/circulation', icon: Library, permission: 'library.manage' },
    ],
  },
  {
    label: 'Hostel',
    icon: Home,
    children: [
      { label: 'Dashboard', href: '/management/hostel/dashboard', icon: LayoutDashboard, permission: 'hostel.read' },
      { label: 'Operations & Safety', href: '/management/hostel/operations', icon: ShieldCheck, permission: 'hostel.manage' },
    ],
  },
  {
    label: 'Human Resources',
    icon: Users,
    children: [
      { label: 'Dashboard', href: '/management/hr/dashboard', icon: LayoutDashboard, permission: 'hr.read' },
      { label: 'Compliance & Reviews', href: '/management/hr/compliance', icon: ShieldCheck, permission: 'hr.read' },
      { label: 'Payroll', href: '/management/payroll/dashboard', icon: Wallet, permission: 'payroll.read' },
    ],
  },
  {
    label: 'Accounting',
    icon: Landmark,
    children: [
      { label: 'Dashboard', href: '/management/accounting/dashboard', icon: LayoutDashboard, permission: 'accounting.read' },
      { label: 'Chart of Accounts', href: '/management/accounting/chart-of-accounts', icon: FolderTree, permission: 'accounting.read' },
      { label: 'Journal Entries', href: '/management/accounting/journal-entries', icon: BookOpen, permission: 'accounting.manage' },
      { label: 'Financial Reports', href: '/management/accounting/reports', icon: BarChart3, permission: 'accounting.read' },
      { label: 'Bank Reconciliation', href: '/management/accounting/bank-reconciliation', icon: Landmark, permission: 'accounting.manage' },
    ],
  },
  {
    label: 'Inventory & Procurement',
    icon: ShoppingCart,
    children: [
      { label: 'Inventory Dashboard', href: '/management/inventory/dashboard', icon: LayoutDashboard, permission: 'inventory.read' },
      { label: 'Procurement Dashboard', href: '/management/procurement/dashboard', icon: LayoutDashboard, permission: 'procurement.read' },
      { label: 'Purchase Requests', href: '/management/procurement/requests', icon: ShoppingCart, permission: 'procurement.manage' },
    ],
  },
  {
    label: 'Assets',
    icon: ShieldCheck,
    children: [
      { label: 'Asset Dashboard', href: '/management/assets/dashboard', icon: LayoutDashboard, permission: 'assets.read' },
    ],
  },
  {
    label: 'Security & Gate',
    icon: ShieldCheck,
    children: [
      { label: 'Security Dashboard', href: '/management/security/dashboard', icon: LayoutDashboard, permission: 'security.read' },
    ],
  },
  {
    label: 'Workflows & Approvals',
    icon: GitBranch,
    children: [
      { label: 'Approval Inbox', href: '/management/workflow/inbox', icon: GitBranch, permission: 'workflow.read' },
    ],
  },
  {
    label: 'Information Management',
    icon: FolderTree,
    children: [
      { label: 'Document Center', href: '/management/dms', icon: FolderTree, permission: 'dms.read' },
      { label: 'Certificates', href: '/management/certificates', icon: ShieldCheck, permission: 'certificates.read' },
      { label: 'Data Exchange', href: '/management/exchange', icon: History, permission: 'exchange.manage' },
    ],
  },
  {
    label: 'Platform Control Plane',
    icon: ShieldCheck,
    children: [
      { label: 'Control Plane', href: '/platform/dashboard', icon: LayoutDashboard, permission: 'platform.manage' },
      { label: 'Feature Flags', href: '/platform/feature-flags', icon: ToggleRight, permission: 'platform.manage' },
      { label: 'Audit Center', href: '/platform/audit', icon: History, permission: 'platform.read' },
      { label: 'Support & Impersonation', href: '/platform/support', icon: ShieldCheck, permission: 'platform.manage' },
    ],
  },
  { label: 'Students Directory', icon: Users, href: '/management/students', permission: 'students.read' },
  { label: 'Master Data', icon: School, href: '/management/organizations', permission: 'settings.manage' },
  { label: 'Settings', icon: Settings, href: '/management/settings', permission: 'settings.read' },
];
