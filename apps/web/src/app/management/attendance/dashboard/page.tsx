'use client';

import React from 'react';
import { PageHeader } from '../../../../components/common/PageHeader';
import { Card } from '../../../../components/common/Card';
import { CheckCircle2, XCircle, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

export default function AttendanceDashboardPage() {
  const stats = [
    { label: 'Overall Attendance Rate', value: '96.4%', change: '+1.2%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
    { label: 'Present Students', value: '2,738', change: '96.4%', icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Absent Students', value: '102', change: '3.6%', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
    { label: 'Late Arrivals', value: '24', change: '0.8%', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Attendance Command Center"
        subtitle="Real-time campus presence analytics, ADMS biometric synchronization, and dropout risk alerts"
        badge="Live ADMS Push"
        badgeVariant="SUCCESS"
        breadcrumbs={[
          { label: 'SchoolOS', href: '/management/dashboard' },
          { label: 'Attendance' },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-5 rounded-2xl border border-surface-border shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-muted">{stat.label}</p>
              <p className="text-2xl font-bold text-text-primary tracking-tight mt-1">{stat.value}</p>
              <p className="text-[11px] font-bold text-text-secondary mt-0.5">{stat.change}</p>
            </div>
            <div className={`p-3 rounded-xl border ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Attendance Rate by Grade">
          <div className="space-y-3">
            {[
              { grade: 'Grade 10', rate: 98 },
              { grade: 'Grade 9', rate: 96 },
              { grade: 'Grade 8', rate: 94 },
            ].map((g) => (
              <div key={g.grade} className="space-y-1 text-xs font-bold">
                <div className="flex justify-between">
                  <span className="text-text-primary">{g.grade}</span>
                  <span className="text-primary">{g.rate}%</span>
                </div>
                <div className="w-full h-2 bg-surface-background rounded-full overflow-hidden border border-surface-border">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${g.rate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Attendance Risk Alerts"
          action={
            <span className="flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
              <AlertTriangle className="w-3 h-3" /> 3 High Risk
            </span>
          }
        >
          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-red-50/50 border border-red-200 rounded-xl">
              <p className="font-bold text-red-900">Consecutive Absence Warning: Michael Chen</p>
              <p className="text-[11px] text-red-700 mt-0.5">Absent for 4 consecutive days without medical note.</p>
            </div>
            <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl">
              <p className="font-bold text-amber-900">Unsubmitted Attendance: Grade 7-B</p>
              <p className="text-[11px] text-amber-700 mt-0.5">Morning attendance session unsubmitted by class teacher.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
