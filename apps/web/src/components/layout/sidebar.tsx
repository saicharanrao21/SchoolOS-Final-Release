'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  School,
  MapPin,
  ShieldCheck,
  History,
  Settings,
  LogOut,
  Calendar,
  BookOpen,
  Layers,
  Home,
  Briefcase,
  UserPlus,
  FileText,
  Mail,
  Wallet,
  Plus,
  Landmark,
  FolderTree,
  BarChart3,
  CheckCircle2,
  FileCheck2,
  Clock,
  Library,
  Bell,
  Settings2,
  GraduationCap,
  FileSpreadsheet,
  Bus,
  Route,
  Navigation,
  RefreshCcw,
  Hotel,
  UserCheck,
  ClipboardList,
  MessageSquare,
  ShoppingCart,
  AlertTriangle,
  GitBranch,
  Inbox,
  Wrench,
  Radio,
  Send,
  CreditCard,
  Zap,
  Scale,
  Receipt,
  ToggleRight,
  HeartPulse,
  TrendingUp
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/management/dashboard' },
  {
    label: 'Academics',
    icon: BookOpen,
    children: [
      { label: 'Timetables', href: '/management/academics/timetables', icon: Calendar },
      { label: 'Curriculum', href: '/management/academics/curriculum', icon: Library },
      { label: 'Homework', href: '/management/academics/homework', icon: FileText },
    ]
  },
  {
    label: 'Digital Learning',
    icon: GraduationCap,
    children: [
      { label: 'LMS Dashboard', href: '/management/lms/dashboard', icon: LayoutDashboard },
      { label: 'Courses & Content', href: '/management/lms/courses', icon: BookOpen },
      { label: 'Live Classes', href: '/management/lms/live-classes', icon: Radio },
      { label: 'Quizzes & Assessments', href: '/management/lms/quizzes', icon: ClipboardList },
    ]
  },
  {
    label: 'Examinations',
    icon: GraduationCap,
    children: [
      { label: 'Dashboard', href: '/management/exams/dashboard', icon: LayoutDashboard },
      { label: 'Exam List', href: '/management/exams/examinations', icon: Calendar },
      { label: 'Marks Entry', href: '/management/exams/mark-entry', icon: FileSpreadsheet },
      { label: 'Result Sheets', href: '/management/exams/results', icon: ShieldCheck },
      { label: 'Report Cards', href: '/management/exams/report-cards', icon: FileText },
    ]
  },
  {
    label: 'Attendance',
    icon: CheckCircle2,
    children: [
      { label: 'Dashboard', href: '/management/attendance/dashboard', icon: LayoutDashboard },
      { label: 'Mark Attendance', href: '/management/attendance/mark', icon: CheckCircle2 },
      { label: 'Corrections', href: '/management/attendance/corrections', icon: Clock },
      { label: 'Attendance Intelligence', href: '/management/attendance/intelligence', icon: TrendingUp },
      { label: 'Leave Requests', href: '/management/attendance/leave-requests', icon: FileText },
    ]
  },
  {
    label: 'Admissions',
    icon: UserPlus,
    children: [
      { label: 'Dashboard', href: '/management/admissions/dashboard', icon: LayoutDashboard },
      { label: 'Leads & Enquiries', href: '/management/admissions/enquiries', icon: Mail },
      { label: 'Applications', href: '/management/admissions/applications', icon: FileText },
    ]
  },
  {
    label: 'Finance',
    icon: Wallet,
    children: [
{ label: 'Collection Control', href: '/management/finance/collection', icon: Wallet },
      { label: 'Dashboard', href: '/management/finance/dashboard', icon: LayoutDashboard },
      { label: 'Fee Structures', href: '/management/finance/fee-structures', icon: Layers },
      { label: 'Invoices', href: '/management/finance/invoices', icon: FileText },
      { label: 'Collect Fee', href: '/management/finance/collect', icon: Plus },
    ]
  },
  {
    label: 'Communications',
    icon: Send,
    children: [
      { label: 'Dashboard', href: '/management/communications/dashboard', icon: LayoutDashboard },
      { label: 'Broadcasts', href: '/management/communications/dashboard', icon: Radio },
      { label: 'Inbox', href: '/management/communications/inbox', icon: MessageSquare },
      { label: 'Templates', href: '/management/notifications/templates', icon: FileSpreadsheet },
      { label: 'Gateways', href: '/management/notifications/gateways', icon: Settings2 },
    ]
  },
  {
    label: 'Transport',
    icon: Bus,
    children: [
      { label: 'Dashboard', href: '/management/transport/dashboard', icon: LayoutDashboard },
      { label: 'Routes', href: '/management/transport/routes', icon: Route },
      { label: 'Vehicles', href: '/management/transport/vehicles', icon: Bus },
      { label: 'Active Trips', href: '/management/transport/trips', icon: Navigation },
      { label: 'Maintenance', href: '/management/transport/maintenance', icon: Wrench },
      { label: 'Safety & Incidents', href: '/management/transport/safety', icon: ShieldCheck },
    ]
  },
  {
    label: 'Health & Wellness',
    icon: HeartPulse,
    children: [
      { label: 'Health Centre', href: '/management/health/dashboard', icon: HeartPulse },
    ]
  },
  {
    label: 'Student Life',
    icon: Users,
    children: [
      { label: 'Behavior & Discipline', href: '/management/student-life/dashboard', icon: ShieldCheck },
      { label: 'Counseling & Wellbeing', href: '/management/student-life/counseling', icon: HeartPulse },
    ]
  },
  {
    label: 'Library',
    icon: Library,
    children: [
      { label: 'Dashboard', href: '/management/library/dashboard', icon: LayoutDashboard },
      { label: 'Books', href: '/management/library/books', icon: BookOpen },
      { label: 'Circulation', href: '/management/library/circulation', icon: RefreshCcw },
      { label: 'Members', href: '/management/library/members', icon: Users },
    ]
  },
  {
    label: 'Hostel',
    icon: Home,
    children: [
      { label: 'Dashboard', href: '/management/hostel/dashboard', icon: LayoutDashboard },
      { label: 'Rooms', href: '/management/hostel/rooms', icon: Hotel },
      { label: 'Allocations', href: '/management/hostel/allocations', icon: UserCheck },
      { label: 'Outpasses', href: '/management/hostel/outpasses', icon: LogOut },
      { label: 'Operations & Safety', href: '/management/hostel/operations', icon: ShieldCheck },
    ]
  },
  {
    label: 'Events',
    icon: Calendar,
    children: [
      { label: 'Dashboard', href: '/management/events/dashboard', icon: LayoutDashboard },
      { label: 'All Events', href: '/management/events/list', icon: Calendar },
      { label: 'Registrations', href: '/management/events/registrations', icon: ClipboardList },
    ]
  },
  {
    label: 'PTM',
    icon: UserPlus,
    children: [
      { label: 'Dashboard', href: '/management/ptm/dashboard', icon: LayoutDashboard },
      { label: 'Schedule', href: '/management/ptm/schedule', icon: Clock },
      { label: 'Meetings', href: '/management/ptm/meetings', icon: MessageSquare },
    ]
  },
  {
    label: 'Human Resources',
    icon: Users,
    children: [
      { label: 'Dashboard', href: '/management/hr/dashboard', icon: LayoutDashboard },
      { label: 'Staff Directory', href: '/management/hr/employees', icon: Users },
      { label: 'Departments', href: '/management/departments', icon: Briefcase },
      { label: 'Compliance & Reviews', href: '/management/hr/compliance', icon: FileCheck2 },
    ]
  },
  {
    label: 'Analytics & BI',
    icon: BarChart3,
    children: [
      { label: 'Executive BI', href: '/management/analytics/executive', icon: LayoutDashboard },
      { label: 'Student Insights', href: '/management/analytics/students', icon: Users },
      { label: 'Financial Analytics', href: '/management/analytics/finance', icon: Wallet },
      { label: 'Academic Reports', href: '/management/analytics/academics', icon: BookOpen },
    ]
  },
  {
    label: 'Workflows & Approvals',
    icon: GitBranch,
    children: [
      { label: 'Approval Inbox', href: '/management/workflow/inbox', icon: Inbox },
      { label: 'My Requests', href: '/management/workflow/my-requests', icon: FileText },
      { label: 'Workflow Builder', href: '/management/workflow/builder', icon: Settings },
    ]
  },
  {
    label: 'Payroll',
    icon: Wallet,
    children: [
      { label: 'Dashboard', href: '/management/payroll/dashboard', icon: LayoutDashboard },
      { label: 'Payroll Runs', href: '/management/payroll/runs', icon: RefreshCcw },
    ]
  },
  {
    label: 'Inventory',
    icon: FolderTree,
    children: [
      { label: 'Dashboard', href: '/management/inventory/dashboard', icon: LayoutDashboard },
      { label: 'Items', href: '/management/inventory/items', icon: BookOpen },
      { label: 'Stock Ledger', href: '/management/inventory/ledger', icon: History },
      { label: 'Warehouses', href: '/management/inventory/warehouses', icon: Home },
    ]
  },
  {
    label: 'Procurement',
    icon: ShoppingCart,
    children: [
      { label: 'Dashboard', href: '/management/procurement/dashboard', icon: LayoutDashboard },
      { label: 'Purchase Orders', href: '/management/procurement/orders', icon: FileText },
      { label: 'Vendors', href: '/management/procurement/vendors', icon: Users },
      { label: 'Goods Receipt', href: '/management/procurement/receipts', icon: CheckCircle2 },
    ]
  },
  {
    label: 'Assets',
    icon: ShieldCheck,
    children: [
      { label: 'Dashboard', href: '/management/assets/dashboard', icon: LayoutDashboard },
      { label: 'Register', href: '/management/assets/register', icon: FileText },
      { label: 'Assignments', href: '/management/assets/assignments', icon: UserCheck },
      { label: 'Maintenance', href: '/management/assets/maintenance', icon: Settings },
    ]
  },
  {
    label: 'Security & Safety',
    icon: ShieldCheck,
    children: [
      { label: 'Dashboard', href: '/management/security/dashboard', icon: LayoutDashboard },
      { label: 'Visitors', href: '/management/security/visitors', icon: Users },
      { label: 'Student Pickup', href: '/management/security/pickups', icon: UserCheck },
      { label: 'Incidents', href: '/management/security/incidents', icon: AlertTriangle },
    ]
  },
  {
    label: 'Information Management',
    icon: FolderTree,
    children: [
      { label: 'Document Center', href: '/management/dms', icon: FileText },
      { label: 'Certificates', href: '/management/certificates', icon: ShieldCheck },
      { label: 'Data Exchange', href: '/management/exchange', icon: RefreshCcw },
    ]
  },
  {
    label: 'Platform Billing',
    icon: CreditCard,
    children: [
      { label: 'Subscription', href: '/management/billing/dashboard', icon: LayoutDashboard },
      { label: 'Plans & Pricing', href: '/management/billing/plans', icon: Zap },
    ]
  },
  {
    label: 'Internal Operations',
    icon: Briefcase,
    children: [
      { label: 'Internal Finance', href: '/management/internal/finance', icon: Receipt },
      { label: 'Legal & Compliance', href: '/management/internal/legal', icon: Scale },
    ]
  },
  {
    label: 'Superadmin Control Plane',
    icon: ShieldCheck,
    children: [
      { label: 'Control Plane', href: '/platform/dashboard', icon: LayoutDashboard },
      { label: 'Feature Flags', href: '/platform/feature-flags', icon: ToggleRight },
      { label: 'Audit Center', href: '/platform/audit', icon: History },
      { label: 'Support & Impersonation', href: '/platform/support', icon: UserCheck },
    ]
  },
  {
    label: 'Accounting',
    icon: Landmark,
    children: [
      { label: 'Dashboard', href: '/management/accounting/dashboard', icon: LayoutDashboard },
      { label: 'Chart of Accounts', href: '/management/accounting/chart-of-accounts', icon: FolderTree },
      { label: 'Journal Entries', href: '/management/accounting/journal-entries', icon: FileText },
      { label: 'Financial Reports', href: '/management/accounting/reports', icon: BarChart3 },
      { label: 'Bank Reconciliation', href: '/management/accounting/bank-reconciliation', icon: Landmark },
    ]
  },
  {
    label: 'Notifications',
    icon: Bell,
    children: [
      { label: 'Dashboard', href: '/management/notifications/dashboard', icon: LayoutDashboard },
      { label: 'Templates', href: '/management/notifications/templates', icon: FileText },
      { label: 'Delivery Logs', href: '/management/notifications/logs', icon: History },
      { label: 'Settings', href: '/management/notifications/rules', icon: Settings2 },
    ]
  },
  { label: 'Students', icon: Users, href: '/management/students' },
  {
    label: 'Master Data',
    icon: ShieldCheck,
    children: [
      { label: 'Organizations', href: '/management/organizations', icon: ShieldCheck },
      { label: 'Schools', href: '/management/schools', icon: School },
      { label: 'Campuses', href: '/management/campuses', icon: MapPin },
      { label: 'Departments', href: '/management/departments', icon: Briefcase },
      { label: 'Locations', href: '/management/locations', icon: Home },
      { label: 'Houses', href: '/management/houses', icon: Layers },
    ]
  },
  {
    label: 'Academic Setup',
    icon: BookOpen,
    children: [
      { label: 'Academic Years', href: '/management/academic-years', icon: Calendar },
      { label: 'Classes & Sections', href: '/management/classes', icon: Layers },
      { label: 'Subjects', href: '/management/subjects', icon: BookOpen },
    ]
  },
  { label: 'Users', icon: Users, href: '/management/users' },
  { label: 'Audit Logs', icon: History, href: '/management/audit' },
  { label: 'Settings', icon: Settings, href: '/management/settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-sidebar-background flex flex-col h-screen text-sidebar-foreground transition-all duration-300 ease-in-out border-r border-white/5">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">S</div>
        <span className="text-xl font-bold text-white tracking-tight">SchoolOS</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <div key={item.label} className="space-y-1">
            {item.children ? (
              <>
                <div className="px-4 py-2 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  {item.label}
                </div>
                {item.children.map((child) => {
                  const isActive = pathname === child.href;
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group",
                        isActive
                          ? "bg-sidebar-active text-sidebar-activeForeground shadow-sm"
                          : "hover:bg-sidebar-active/50 hover:text-white"
                      )}
                    >
                      <child.icon className={cn(
                        "w-4 h-4",
                        isActive ? "text-primary" : "text-sidebar-foreground group-hover:text-white"
                      )} />
                      <span className="font-medium text-sm">{child.label}</span>
                    </Link>
                  );
                })}
              </>
            ) : (
              <Link
                href={item.href!}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group",
                  pathname === item.href
                    ? "bg-sidebar-active text-sidebar-activeForeground shadow-sm"
                    : "hover:bg-sidebar-active/50 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4",
                  pathname === item.href ? "text-primary" : "text-sidebar-foreground group-hover:text-white"
                )} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5 bg-sidebar-background/50 backdrop-blur-sm">
        <button className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full text-sidebar-foreground hover:bg-red-500/10 hover:text-red-500 transition-all duration-200">
          <LogOut className="w-4 h-4" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}
