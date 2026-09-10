'use client';

import React, { useState } from 'react';
import { PageHeader } from '../../../components/common/PageHeader';
import { Card } from '../../../components/common/Card';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { FilterBar } from '../../../components/common/FilterBar';
import { Building, ShieldCheck, Users, TrendingUp, Plus, ArrowUpRight } from 'lucide-react';

export default function SuperAdminPlatformDashboardPage() {
  const [search, setSearch] = useState('');

  const kpis = [
    { label: 'Total SaaS Tenants', value: '142', change: '+12 this month', icon: Building, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
    { label: 'Active Subscriptions', value: '128', change: '86% Conversion', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Total Platform Students', value: '48,250', change: 'Across all tenants', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Monthly Recurring Revenue', value: '$38,200', change: '+18% YoY', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  ];

  const mockTenants = [
    { id: 'org-1', name: 'Greenwood International Schools', code: 'GREENWOOD', schools: 3, students: '2,450', plan: 'Enterprise Growth', status: 'ACTIVE' },
    { id: 'org-2', name: 'Oakridge Academy Network', code: 'OAKRIDGE', schools: 5, students: '4,120', plan: 'Enterprise Growth', status: 'ACTIVE' },
    { id: 'org-3', name: 'St. Marks Grammar School', code: 'STMARKS', schools: 1, students: '420', plan: 'Starter Plan', status: 'TRIAL' },
  ];

  const filtered = mockTenants.filter((t) =>
    `${t.name} ${t.code} ${t.plan}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Superadmin SaaS Platform Control Plane"
        subtitle="Provision tenant organizations, feature flags, global audit trails, and support impersonation sessions"
        badge="Superadmin Plane"
        badgeVariant="SUCCESS"
        breadcrumbs={[
          { label: 'SchoolOS', href: '/platform/dashboard' },
          { label: 'Platform Control' },
        ]}
        actions={
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95">
            <Plus className="w-4 h-4" /> Provision New SaaS Tenant
          </button>
        }
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter tenant organization name, code, or plan..."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white p-5 rounded-2xl border border-surface-border shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-muted">{kpi.label}</p>
              <p className="text-2xl font-bold text-text-primary mt-1">{kpi.value}</p>
              <p className="text-[11px] font-bold text-text-secondary mt-0.5">{kpi.change}</p>
            </div>
            <div className={`p-3 rounded-xl border ${kpi.bg} ${kpi.color}`}>
              <kpi.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      <Card title="Provisioned SaaS Tenant Organizations">
        <div className="divide-y divide-surface-border text-xs font-medium">
          {filtered.map((tenant) => (
            <div key={tenant.id} className="py-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-text-primary text-sm">{tenant.name}</p>
                <p className="text-text-muted">{tenant.code} • {tenant.schools} Schools • {tenant.students} Students • Plan: {tenant.plan}</p>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={tenant.status} />
                <button className="text-primary font-bold hover:underline flex items-center gap-1">
                  Manage <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
