'use client';

import React from 'react';
import { PageHeader } from '../../../../components/common/PageHeader';
import { Card } from '../../../../components/common/Card';
import { ClipboardCheck, LogIn, Utensils, ArrowLeftRight } from 'lucide-react';

export default function HostelOperationsPage() {
  const cards = [
    { title: 'Room Inspections', description: 'Schedule inspections, record findings, scores, and corrective actions.', icon: ClipboardCheck },
    { title: 'Visitor Control', description: 'Register expected visitors and close visits with a complete check-out trail.', icon: LogIn },
    { title: 'Mess Attendance', description: 'Record meal service for residents by breakfast, lunch, snacks, and dinner.', icon: Utensils },
    { title: 'Bed Transfers', description: 'Request and complete controlled room/bed transfers without double allocation.', icon: ArrowLeftRight },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Hostel Operations & Resident Safety"
        subtitle="Manage residential room allocations, meal mess tracking, bed transfers, and warden inspections"
        badge="Residential Safety"
        badgeVariant="SUCCESS"
        breadcrumbs={[
          { label: 'SchoolOS', href: '/management/dashboard' },
          { label: 'Hostel' },
          { label: 'Operations' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((c) => (
          <Card key={c.title}>
            <div className="flex items-start gap-3">
              <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 text-primary shrink-0">
                <c.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-text-primary">{c.title}</h3>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">{c.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
