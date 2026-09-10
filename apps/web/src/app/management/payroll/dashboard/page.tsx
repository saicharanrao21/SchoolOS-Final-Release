'use client';

import React, { useState } from 'react';
import { PageHeader } from '../../../../components/common/PageHeader';
import { Card } from '../../../../components/common/Card';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { FilterBar } from '../../../../components/common/FilterBar';
import { Wallet, Plus, CheckCircle2, Activity, Clock } from 'lucide-react';

export default function PayrollDashboardPage() {
  const [search, setSearch] = useState('');

  const payrollRuns = [
    { period: 'August 2026', count: 142, totalNet: '$142,500', status: 'LOCKED' },
    { period: 'July 2026', count: 140, totalNet: '$140,200', status: 'PAID' },
    { period: 'June 2026', count: 138, totalNet: '$138,800', status: 'PAID' },
  ];

  const filtered = payrollRuns.filter((r) =>
    r.period.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Payroll & Compensation Processing Workbench"
        subtitle="Process monthly staff salary runs, calculate statutory deductions, and issue employee payslips"
        badge="Automated Payroll Engine"
        badgeVariant="SUCCESS"
        breadcrumbs={[
          { label: 'SchoolOS', href: '/management/dashboard' },
          { label: 'Payroll' },
        ]}
        actions={
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95">
            <Plus className="w-4 h-4" /> Start New Payroll Run
          </button>
        }
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter pay period name..."
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Net Payroll (This Month)', value: '$142,500', icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
          { label: 'Employees Paid', value: '138 / 142', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Total Deductions', value: '$28,400', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
          { label: 'Loan Recoveries', value: '$4,200', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
        ].map((item) => (
          <div key={item.label} className="bg-white p-5 rounded-2xl border border-surface-border shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-muted">{item.label}</p>
              <p className="text-2xl font-bold text-text-primary mt-1">{item.value}</p>
            </div>
            <div className={`p-3 rounded-xl border ${item.bg} ${item.color}`}>
              <item.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      <Card title="Payroll Runs History">
        <div className="divide-y divide-surface-border text-xs">
          {filtered.map((run) => (
            <div key={run.period} className="py-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-text-primary text-sm">{run.period}</p>
                <p className="text-text-muted">{run.count} Employees Included</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-bold text-primary text-base">{run.totalNet}</p>
                <StatusBadge status={run.status} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
