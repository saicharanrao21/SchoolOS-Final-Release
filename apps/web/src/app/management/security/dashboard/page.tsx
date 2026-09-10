'use client';

import React, { useState } from 'react';
import { PageHeader } from '../../../../components/common/PageHeader';
import { Card } from '../../../../components/common/Card';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { FilterBar } from '../../../../components/common/FilterBar';
import { ShieldCheck, Users, UserCheck, AlertTriangle, Activity, Plus, QrCode, Bell } from 'lucide-react';

export default function SecurityDashboardPage() {
  const [search, setSearch] = useState('');

  const mockGateLogs = [
    { id: '1', person: 'Alice Johnson (Student)', action: 'Student Pickup', gate: 'Main Gate', status: 'VERIFIED', time: '2m ago' },
    { id: '2', person: 'Robert Smith (Visitor)', action: 'Visitor Entry', gate: 'West Gate', status: 'CHECKED_IN', time: '15m ago' },
    { id: '3', person: 'Express Courier', action: 'Postal Delivery', gate: 'North Gate', status: 'COMPLETED', time: '45m ago' },
  ];

  const filtered = mockGateLogs.filter((l) =>
    `${l.person} ${l.action} ${l.gate}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Gate Security & Campus Safety Command"
        subtitle="Monitor campus entry points, visitor gate passes, student release verification, and CCTV feeds"
        badge="Zero-Trust Gate"
        badgeVariant="SUCCESS"
        breadcrumbs={[
          { label: 'SchoolOS', href: '/management/dashboard' },
          { label: 'Security' },
        ]}
        actions={
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-white border border-surface-border hover:bg-surface-hover text-text-primary px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm">
              <QrCode className="w-4 h-4 text-primary" /> Verify Pass
            </button>
            <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95">
              <Plus className="w-4 h-4" /> Register Visitor
            </button>
          </div>
        }
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter person, gate, or action..."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Visitors On Campus', value: '12 Active', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
          { label: 'Verified Pickups', value: '42 Released', icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Active Incidents', value: '2 Under Review', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
          { label: 'Gate Activity (6h)', value: '184 Passes', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
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

      <Card title="Live Gate Entry / Exit Activity Stream">
        <div className="divide-y divide-surface-border text-xs font-medium">
          {filtered.map((l) => (
            <div key={l.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-text-primary text-sm">{l.person}</p>
                <p className="text-text-muted">{l.action} • {l.gate} • {l.time}</p>
              </div>
              <StatusBadge status={l.status} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
