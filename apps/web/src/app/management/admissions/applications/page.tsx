'use client';

import React, { useState } from 'react';
import { PageHeader } from '../../../../components/common/PageHeader';
import { Card } from '../../../../components/common/Card';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { FilterBar } from '../../../../components/common/FilterBar';
import { Plus, ChevronRight, UserCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function AdmissionsApplicationsPage() {
  const [search, setSearch] = useState('');

  const mockApplications = [
    { id: '1', appNo: 'APP-SCH260045', name: 'Alice Smith', class: 'Grade 5', campus: 'Main Campus', date: '2026-08-25', status: 'APPLICATION' },
    { id: '2', appNo: 'APP-SCH260046', name: 'Robert Brown', class: 'Grade 1', campus: 'Main Campus', date: '2026-08-24', status: 'ENTRANCE_TEST' },
    { id: '3', appNo: 'APP-SCH260047', name: 'Emily Davis', class: 'Grade 10', campus: 'North Campus', date: '2026-08-24', status: 'OFFERED' },
  ];

  const filtered = mockApplications.filter((app) =>
    `${app.name} ${app.appNo}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Admission Applications Workbench"
        subtitle="Review student applications, schedule entrance exams, conducts interviews, and convert to active enrollments"
        badge="Applicant Pipeline"
        badgeVariant="SUCCESS"
        breadcrumbs={[
          { label: 'SchoolOS', href: '/management/dashboard' },
          { label: 'Admissions' },
          { label: 'Applications' },
        ]}
        actions={
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95">
            <Plus className="w-4 h-4" /> New Application
          </button>
        }
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter applicant name or application ID..."
      />

      <Card title="Active Applications">
        <div className="divide-y divide-surface-border">
          {filtered.map((app) => (
            <div key={app.id} className="py-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-primary font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-text-primary text-sm">{app.name}</p>
                  <p className="text-text-muted">{app.appNo} • {app.class} ({app.campus}) • Submitted: {app.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={app.status} />
                <Link
                  href={`/management/admissions/applications/${app.id}`}
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors"
                >
                  Process <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
