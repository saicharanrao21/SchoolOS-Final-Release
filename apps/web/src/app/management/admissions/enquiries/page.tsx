'use client';

import React, { useState } from 'react';
import { PageHeader } from '../../../../components/common/PageHeader';
import { Card } from '../../../../components/common/Card';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { FilterBar } from '../../../../components/common/FilterBar';
import { Search, Plus, Phone, MessageSquare, MoreVertical, Sparkles, UserCheck } from 'lucide-react';

export default function AdmissionsEnquiriesPage() {
  const [search, setSearch] = useState('');

  const mockEnquiries = [
    { id: '1', enquiryNumber: 'ENQ-SCH260001', name: 'James Wilson', phone: '+1 234 567 8901', email: 'james.w@test.com', class: 'Grade 5', source: 'Website', date: '2026-08-24', status: 'NEW' },
    { id: '2', enquiryNumber: 'ENQ-SCH260002', name: 'Sophia Martinez', phone: '+1 987 654 3210', email: 'sophia.m@test.com', class: 'Grade 8', source: 'Walk-in', date: '2026-08-22', status: 'FOLLOW_UP' },
    { id: '3', enquiryNumber: 'ENQ-SCH260003', name: 'William Brown', phone: '+1 555 012 3456', email: 'william.b@test.com', class: 'Grade 2', source: 'Referral', date: '2026-08-20', status: 'INTERESTED' },
  ];

  const filtered = mockEnquiries.filter((e) =>
    `${e.name} ${e.enquiryNumber} ${e.phone}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Admissions CRM & Lead Funnel"
        subtitle="Capture, nurture, and track prospective student enquiries and follow-ups"
        badge="Live CRM Pipeline"
        badgeVariant="SUCCESS"
        breadcrumbs={[
          { label: 'SchoolOS', href: '/management/dashboard' },
          { label: 'Admissions CRM' },
        ]}
        actions={
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95">
            <Plus className="w-4 h-4" /> Add Lead / Enquiry
          </button>
        }
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter prospect name, lead ID, or phone..."
      />

      <Card title="Prospective Leads Queue">
        <div className="divide-y divide-surface-border">
          {filtered.map((enq) => (
            <div key={enq.id} className="py-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                  {enq.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="font-bold text-text-primary text-sm">{enq.name}</p>
                  <p className="text-text-muted">{enq.enquiryNumber} • Interested in {enq.class} • Source: {enq.source}</p>
                  <p className="text-[11px] text-text-secondary mt-0.5">{enq.phone} • {enq.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={enq.status} />
                <button className="px-3 py-1.5 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover transition-colors">
                  Log Follow-up
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
