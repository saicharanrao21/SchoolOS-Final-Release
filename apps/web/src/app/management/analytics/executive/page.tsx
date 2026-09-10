'use client';

import React, { useState } from 'react';
import { PageHeader } from '../../../../components/common/PageHeader';
import { Card } from '../../../../components/common/Card';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { TrendingUp, Users, Wallet, GraduationCap, Calendar, Download } from 'lucide-react';

export default function ExecutiveBIDashboardPage() {
  const kpis = [
    { label: 'Total Enrolled Students', value: '4,842', trend: '+12%', up: true, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Overall Attendance Rate', value: '94.2%', trend: '-0.8%', up: false, icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Term Revenue Collected', value: '$1.42M', trend: '+24%', up: true, icon: Wallet, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
    { label: 'Academic Pass Rate', value: '98.5%', trend: '+0.5%', up: true, icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Executive BI & Institutional Health Dashboard"
        subtitle="Cross-school financial analytics, academic pass rates, and operational performance trends"
        badge="Executive Analytics"
        badgeVariant="SUCCESS"
        breadcrumbs={[
          { label: 'SchoolOS', href: '/management/dashboard' },
          { label: 'Analytics' },
          { label: 'Executive BI' },
        ]}
        actions={
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95">
            <Download className="w-4 h-4" /> Export Executive BI Report
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white p-5 rounded-2xl border border-surface-border shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-muted">{kpi.label}</p>
              <p className="text-2xl font-bold text-text-primary mt-1">{kpi.value}</p>
              <p className={`text-[11px] font-bold mt-0.5 ${kpi.up ? 'text-green-700' : 'text-red-700'}`}>
                {kpi.trend} vs last session
              </p>
            </div>
            <div className={`p-3 rounded-xl border ${kpi.bg} ${kpi.color}`}>
              <kpi.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Monthly Revenue vs Collection Velocity">
          <div className="space-y-3 text-xs font-semibold">
            <div className="p-3 bg-surface-background rounded-xl border border-surface-border flex justify-between">
              <span>Billed Revenue (Term)</span>
              <span className="font-bold text-text-primary">$1,620,000</span>
            </div>
            <div className="p-3 bg-green-50 rounded-xl border border-green-200 flex justify-between text-green-900">
              <span>Collected Revenue</span>
              <span className="font-bold">$1,425,600 (88%)</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex justify-between text-amber-900">
              <span>Outstanding Receivables</span>
              <span className="font-bold">$194,400 (12%)</span>
            </div>
          </div>
        </Card>

        <Card title="Student Enrollment Distribution by Grade Level">
          <div className="space-y-3 text-xs font-semibold">
            {[
              { level: 'Elementary School (Grades 1 - 5)', count: 1240, color: 'bg-blue-600' },
              { level: 'Middle School (Grades 6 - 8)', count: 1842, color: 'bg-indigo-600' },
              { level: 'High School (Grades 9 - 12)', count: 1760, color: 'bg-purple-600' },
            ].map((cat) => (
              <div key={cat.level} className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-text-primary">{cat.level}</span>
                  <span className="text-text-muted">{cat.count} Students</span>
                </div>
                <div className="w-full h-2 bg-surface-background rounded-full overflow-hidden border border-surface-border">
                  <div className={`${cat.color} h-full rounded-full`} style={{ width: `${(cat.count / 2000) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
