export type WidgetSize = 'sm' | 'md' | 'lg' | 'full';

export interface WidgetDefinition {
  id: string;
  title: string;
  category: 'EXECUTIVE' | 'OPERATIONS' | 'FINANCE' | 'ACADEMICS' | 'ATTENDANCE' | 'SECURITY';
  size: WidgetSize;
  minRole?: string;
  permission?: string;
  priority: number;
  description?: string;
}

export const ENTERPRISE_WIDGET_REGISTRY: WidgetDefinition[] = [
  {
    id: 'kpi-overview',
    title: 'Executive KPI Summary',
    category: 'EXECUTIVE',
    size: 'full',
    priority: 1,
    description: 'Active enrollment, attendance rate, fee collection total, and pending approvals.',
  },
  {
    id: 'fee-collection-chart',
    title: 'Fee Collection & Outstanding Balances',
    category: 'FINANCE',
    size: 'md',
    permission: 'finance.read',
    priority: 2,
    description: 'Real-time invoice demand vs collected revenue and outstanding student balances.',
  },
  {
    id: 'attendance-snapshot',
    title: 'Today Student & Staff Attendance',
    category: 'ATTENDANCE',
    size: 'md',
    permission: 'attendance.read',
    priority: 3,
    description: 'Attendance percentage, present/absent breakdown, and biometric sync status.',
  },
  {
    id: 'pending-approvals',
    title: 'Pending Workflow Approvals',
    category: 'OPERATIONS',
    size: 'sm',
    permission: 'workflow.read',
    priority: 4,
    description: 'Requisitions, leave requests, and outpass applications awaiting review.',
  },
  {
    id: 'security-visitors-pickup',
    title: 'Gate Visitors & Student Release Status',
    category: 'SECURITY',
    size: 'sm',
    permission: 'security.read',
    priority: 5,
    description: 'Active gate visitors checked in and active student pickup requests.',
  },
  {
    id: 'recent-activity-feed',
    title: 'Platform Audit & Activity Feed',
    category: 'EXECUTIVE',
    size: 'full',
    priority: 6,
    description: 'Recent administrative actions, login events, and system changes.',
  },
];
