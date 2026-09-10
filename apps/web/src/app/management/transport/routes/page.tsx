'use client';

import React, { useState } from 'react';
import { PageHeader } from '../../../../components/common/PageHeader';
import { Card } from '../../../../components/common/Card';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { FilterBar } from '../../../../components/common/FilterBar';
import { Plus, Route, ChevronRight, Navigation } from 'lucide-react';

export default function TransportRoutesPage() {
  const [search, setSearch] = useState('');

  const mockRoutes = [
    { id: '1', code: 'RT-01', name: 'North City Express', direction: 'BOTH', stops: 12, students: 42, status: 'PUBLISHED' },
    { id: '2', code: 'RT-02', name: 'West Suburb Loop', direction: 'PICKUP', stops: 8, students: 28, status: 'PUBLISHED' },
    { id: '3', code: 'RT-03', name: 'South High Street', direction: 'BOTH', stops: 15, students: 35, status: 'DRAFT' },
  ];

  const filtered = mockRoutes.filter((r) =>
    `${r.name} ${r.code} ${r.direction}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Transport Routes & GPS Fleet Dispatch"
        subtitle="Manage vehicle transit paths, student bus stop allocations, and live route safety logs"
        badge="GPS Tracked"
        badgeVariant="SUCCESS"
        breadcrumbs={[
          { label: 'SchoolOS', href: '/management/dashboard' },
          { label: 'Transport' },
          { label: 'Routes' },
        ]}
        actions={
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95">
            <Plus className="w-4 h-4" /> Create Transport Route
          </button>
        }
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter route name, code, or direction..."
      />

      <Card title="Active Transport Routes">
        <div className="divide-y divide-surface-border text-xs">
          {filtered.map((r) => (
            <div key={r.id} className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold">
                  <Route className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-text-primary text-sm">{r.name}</p>
                  <p className="text-text-muted">{r.code} • Direction: {r.direction} • {r.stops} Stops • {r.students} Assigned Students</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={r.status} />
                <button className="p-2 hover:bg-surface-hover rounded-xl text-primary font-bold flex items-center gap-1">
                  Manage <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
