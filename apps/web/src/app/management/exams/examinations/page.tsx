'use client';

import React, { useState } from 'react';
import { PageHeader } from '../../../../components/common/PageHeader';
import { Card } from '../../../../components/common/Card';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { FilterBar } from '../../../../components/common/FilterBar';
import { Plus, Calendar, ChevronRight, GraduationCap, Sparkles } from 'lucide-react';

export default function ExaminationsManagementPage() {
  const [search, setSearch] = useState('');

  const mockExams = [
    { id: '1', name: 'Term 1 Final Examination', type: 'TERM_EXAM', startDate: '2026-09-12', endDate: '2026-09-25', status: 'SCHEDULED', subjectsCount: 12 },
    { id: '2', name: 'Unit Test 1', type: 'UNIT_TEST', startDate: '2026-08-15', endDate: '2026-08-20', status: 'COMPLETED', subjectsCount: 8 },
    { id: '3', name: 'Online CBT Mathematics Assessment', type: 'CBT_ONLINE', startDate: '2026-10-05', endDate: '2026-10-05', status: 'PUBLISHED', subjectsCount: 1 },
  ];

  const filtered = mockExams.filter((e) =>
    `${e.name} ${e.type}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Examinations & CBT Online Assessment Studio"
        subtitle="Schedule examination cycles, generate seating plans, configure online CBT exams, and evaluate student marks"
        badge="CBT Engine Integrated"
        badgeVariant="SUCCESS"
        breadcrumbs={[
          { label: 'SchoolOS', href: '/management/dashboard' },
          { label: 'Examinations' },
        ]}
        actions={
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95">
            <Plus className="w-4 h-4" /> Schedule New Examination
          </button>
        }
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter examination name or type..."
      />

      <Card title="Active Examination Cycles">
        <div className="divide-y divide-surface-border">
          {filtered.map((exam) => (
            <div key={exam.id} className="py-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-primary font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-text-primary text-sm">{exam.name}</p>
                  <p className="text-text-muted">{exam.type} • {exam.startDate} to {exam.endDate} • {exam.subjectsCount} Subjects</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={exam.status} />
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
