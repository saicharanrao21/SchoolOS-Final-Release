'use client';

import React, { useState } from 'react';
import { PageHeader } from '../../../../components/common/PageHeader';
import { Card } from '../../../../components/common/Card';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { FilterBar } from '../../../../components/common/FilterBar';
import { HeartPulse, Activity, Pill, AlertTriangle, ClipboardPlus } from 'lucide-react';

export default function StudentHealthDashboardPage() {
  const [search, setSearch] = useState('');

  const mockVisits = [
    { id: '1', student: 'Alice Johnson', reason: 'Routine First Aid (Minor Scratch)', time: '10:30 AM', medic: 'Nurse Mary', status: 'COMPLETED' },
    { id: '2', student: 'Michael Chen', reason: 'High Fever & Headache', time: '11:15 AM', medic: 'Nurse Mary', status: 'GUARDIAN_NOTIFIED' },
  ];

  const filtered = mockVisits.filter((v) =>
    `${v.student} ${v.reason}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Health Centre & Student Wellness Operations"
        subtitle="Manage student medical profiles, clinical first-aid visits, allergy registers, and emergency readiness"
        badge="HIPAA Compliant Vault"
        badgeVariant="SUCCESS"
        breadcrumbs={[
          { label: 'SchoolOS', href: '/management/dashboard' },
          { label: 'Health Centre' },
        ]}
        actions={
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95">
            <ClipboardPlus className="w-4 h-4" /> Record Clinical Visit
          </button>
        }
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter student or clinical reason..."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Medical Profiles', value: '2,840 Active', icon: HeartPulse, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
          { label: 'Visits Today', value: '8 Encounters', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Active Medication Rules', value: '14 Prescribed', icon: Pill, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
          { label: 'Emergency Alerts', value: '0 Active', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
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

      <Card title="Today Health Centre Clinical Visits">
        <div className="divide-y divide-surface-border text-xs font-medium">
          {filtered.map((v) => (
            <div key={v.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-text-primary text-sm">{v.student}</p>
                <p className="text-text-muted">{v.reason} • Time: {v.time} • Attending: {v.medic}</p>
              </div>
              <StatusBadge status={v.status} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
