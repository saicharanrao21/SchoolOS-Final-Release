'use client';

import React, { useState } from 'react';
import { PageHeader } from '../../../components/common/PageHeader';
import { Card } from '../../../components/common/Card';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { FilterBar } from '../../../components/common/FilterBar';
import { School, MapPin, Plus, Building2, Globe, Phone, Mail, Hash, Layers } from 'lucide-react';

export default function SchoolsControlPlanePage() {
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const mockSchools = [
    {
      id: 'school-default',
      name: 'SchoolOS Main Campus',
      code: 'MAIN',
      legalName: 'SchoolOS Education Trust',
      affiliation: 'CBSE',
      address: 'Central Square, London, UK',
      phone: '+44 20 1234 5678',
      email: 'admin@schoolos.test',
      timezone: 'UTC',
      currency: 'USD',
      campusesCount: 3,
      studentsCount: 2840,
      status: 'ACTIVE',
    },
    {
      id: 'school-north',
      name: 'SchoolOS North Branch',
      code: 'NORTH',
      legalName: 'SchoolOS North Academy',
      affiliation: 'ICSE',
      address: 'North Hills, CA, USA',
      phone: '+1 415 987 6543',
      email: 'north@schoolos.test',
      timezone: 'America/Los_Angeles',
      currency: 'USD',
      campusesCount: 1,
      studentsCount: 920,
      status: 'ACTIVE',
    },
  ];

  const filtered = mockSchools.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="School Master Data & Control Plane"
        subtitle="Configure institution legal entities, affiliations, timezones, and operational settings"
        badge="Multi-School Scoped"
        badgeVariant="SUCCESS"
        breadcrumbs={[
          { label: 'SchoolOS', href: '/management/dashboard' },
          { label: 'Master Data Control Plane' },
        ]}
        actions={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add New School Entity
          </button>
        }
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter school name or code..."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((school) => (
          <Card key={school.id} className="group hover:border-primary/40 transition-all">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-center text-primary font-bold">
                    <School className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary text-base group-hover:text-primary transition-colors">
                      {school.name}
                    </h3>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
                      Code: {school.code} • Affiliation: {school.affiliation}
                    </p>
                  </div>
                </div>
                <StatusBadge status={school.status} />
              </div>

              <div className="space-y-2 text-xs text-text-secondary pt-2 border-t border-surface-border">
                <p className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  <span className="truncate">{school.legalName}</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  <span className="truncate">{school.address}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  <span>{school.email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  <span>Timezone: {school.timezone} • Currency: {school.currency}</span>
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-surface-border text-xs">
                <div className="flex gap-4">
                  <div>
                    <p className="text-base font-bold text-text-primary">{school.campusesCount}</p>
                    <p className="text-[10px] font-bold text-text-muted uppercase">Campuses</p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-text-primary">{school.studentsCount}</p>
                    <p className="text-[10px] font-bold text-text-muted uppercase">Students</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
