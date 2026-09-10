'use client';

import React, { useState } from 'react';
import { PageHeader } from '../../../../components/common/PageHeader';
import { Card } from '../../../../components/common/Card';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { FilterBar } from '../../../../components/common/FilterBar';
import { Calendar, Clock, Plus, History, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function TimetablesManagementPage() {
  const [search, setSearch] = useState('');

  const mockTimetables = [
    { id: '1', name: 'Grade 10-A Schedule', academicYear: '2026-2027', class: 'Grade 10', section: 'A', status: 'PUBLISHED', version: 2, teacherCoverage: '100%' },
    { id: '2', name: 'Grade 10-B Schedule', academicYear: '2026-2027', class: 'Grade 10', section: 'B', status: 'DRAFT', version: 1, teacherCoverage: '92%' },
    { id: '3', name: 'Grade 9-A Schedule', academicYear: '2026-2027', class: 'Grade 9', section: 'A', status: 'PUBLISHED', version: 1, teacherCoverage: '100%' },
  ];

  const filtered = mockTimetables.filter((t) =>
    `${t.name} ${t.class} ${t.section}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Academic Timetables & Schedules"
        subtitle="Manage class timetables, period definitions, conflict-free teacher assignments, and substitute covers"
        badge="Conflict Resolution Engine"
        badgeVariant="SUCCESS"
        breadcrumbs={[
          { label: 'SchoolOS', href: '/management/dashboard' },
          { label: 'Academics' },
          { label: 'Timetables' },
        ]}
        actions={
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-white border border-surface-border hover:bg-surface-hover text-text-primary px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm">
              <History className="w-4 h-4 text-primary" /> Teacher Substitutions
            </button>
            <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95">
              <Plus className="w-4 h-4" /> Create Timetable
            </button>
          </div>
        }
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter class, section, or timetable name..."
      />

      <Card title="Institutional Schedules Workbench">
        <div className="divide-y divide-surface-border">
          {filtered.map((t) => (
            <div key={t.id} className="py-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-secondary font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-text-primary text-sm">{t.name}</p>
                  <p className="text-text-muted">{t.academicYear} • {t.class} - Section {t.section} • Version {t.version}.0</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200 text-[10px]">
                  <CheckCircle2 className="w-3 h-3" /> {t.teacherCoverage} Staffed
                </span>
                <StatusBadge status={t.status} />
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
