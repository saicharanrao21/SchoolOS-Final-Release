import React from 'react';
import { PageHeader } from '../../../components/common/PageHeader';
import { DashboardGrid } from '../../../components/dashboard/DashboardGrid';

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Enterprise Workspace"
        subtitle="Real-time operational overview, key performance indicators, and active workflow tasks"
        badge="Live System"
        badgeVariant="SUCCESS"
        breadcrumbs={[
          { label: 'SchoolOS', href: '/management/dashboard' },
          { label: 'Workspace Overview' },
        ]}
      />

      <DashboardGrid />
    </div>
  );
}
