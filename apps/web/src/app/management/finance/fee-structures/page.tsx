'use client';

import React, { useState } from 'react';
import { PageHeader } from '../../../../components/common/PageHeader';
import { Card } from '../../../../components/common/Card';
import { FilterBar } from '../../../../components/common/FilterBar';
import { Layers, Plus, ChevronRight, Copy } from 'lucide-react';

export default function FeeStructuresManagementPage() {
  const [search, setSearch] = useState('');

  const structures = [
    { name: 'Annual Composite Fee 2026-27', class: 'Grade 10', category: 'Tuition', total: '$1,250', installments: 4 },
    { name: 'Primary Basic Fee 2026-27', class: 'Grade 1 - 5', category: 'Tuition', total: '$850', installments: 2 },
    { name: 'Transport Fee - North Route', class: 'All Classes', category: 'Transport', total: '$320', installments: 12 },
  ];

  const filtered = structures.filter((s) =>
    `${s.name} ${s.class} ${s.category}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Fee Structures & Installment Schedules"
        subtitle="Define fee components, tuition templates, transport fees, and installment schedules for academic sessions"
        badge="Installment Engine"
        badgeVariant="SUCCESS"
        breadcrumbs={[
          { label: 'SchoolOS', href: '/management/dashboard' },
          { label: 'Fees & Finance' },
          { label: 'Fee Structures' },
        ]}
        actions={
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95">
            <Plus className="w-4 h-4" /> Create Fee Structure
          </button>
        }
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter fee structure name, class, or category..."
      />

      <Card title="Active Fee Templates">
        <div className="divide-y divide-surface-border">
          {filtered.map((s) => (
            <div key={s.name} className="py-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-text-primary text-sm">{s.name}</p>
                  <p className="text-text-muted">{s.class} • Category: {s.category} • {s.installments} Installments</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bold text-text-primary text-base">{s.total}</p>
                  <p className="text-[10px] text-text-muted font-bold uppercase">{s.installments} Payments</p>
                </div>
                <button className="p-2 hover:bg-surface-hover rounded-xl text-text-muted hover:text-primary transition-colors" title="Clone Structure">
                  <Copy className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-surface-hover rounded-xl text-primary font-bold flex items-center gap-1">
                  Details <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
