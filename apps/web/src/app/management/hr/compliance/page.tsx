'use client';

import { useState } from 'react';
import { PageHeader } from '../../../../components/common/PageHeader';
import { Card } from '../../../../components/common/Card';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { FilterBar } from '../../../../components/common/FilterBar';
import { Award, BadgeCheck, FileCheck2, ShieldAlert, Star, Users } from 'lucide-react';

export default function HrCompliancePage() {
  const [search, setSearch] = useState('');

  const documents = [
    { employee: 'Dr. Sarah Connor', id: 'EMP-000041', type: 'Government ID', expiry: '2026-09-12', status: 'VERIFIED' },
    { employee: 'Prof. Marcus Vance', id: 'EMP-000052', type: 'Teaching License', expiry: '2026-09-28', status: 'PENDING' },
    { employee: 'Elena Rostova', id: 'EMP-000067', type: 'First Aid Certificate', expiry: '2026-10-14', status: 'VERIFIED' },
  ];

  const filtered = documents.filter((d) =>
    `${d.employee} ${d.id} ${d.type}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="HR Compliance, Documents & Reviews"
        subtitle="Control staff documentation vault, statutory reviews, teaching credentials, and performance appraisals"
        badge="Audited Vault"
        badgeVariant="SUCCESS"
        breadcrumbs={[
          { label: 'SchoolOS', href: '/management/dashboard' },
          { label: 'Human Resources' },
          { label: 'Compliance' },
        ]}
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter staff name, ID, or document type..."
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Staff', value: '142', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
          { label: 'Verified Credentials', value: '128', icon: FileCheck2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Expiring In 30 Days', value: '7', icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
          { label: 'Reviews Pending', value: '18', icon: Award, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
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

      <Card title="Staff Compliance Document Vault">
        <div className="divide-y divide-surface-border text-xs">
          {filtered.map((d) => (
            <div key={d.id + d.type} className="py-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-text-primary text-sm">{d.employee}</p>
                <p className="text-text-muted">{d.id} • {d.type} • Expires: {d.expiry}</p>
              </div>
              <StatusBadge status={d.status} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
