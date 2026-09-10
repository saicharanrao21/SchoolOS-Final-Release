'use client';

import React from 'react';
import { ClipboardCheck, LogIn, Utensils, ArrowLeftRight, ShieldCheck } from 'lucide-react';

const cards = [
  { title: 'Room Inspections', description: 'Schedule inspections, record findings, scores and corrective actions.', icon: ClipboardCheck },
  { title: 'Visitor Control', description: 'Register expected visitors and close visits with a complete check-out trail.', icon: LogIn },
  { title: 'Mess Attendance', description: 'Record meal service for residents by breakfast, lunch, snacks and dinner.', icon: Utensils },
  { title: 'Bed Transfers', description: 'Request and complete controlled room/bed transfers without double allocation.', icon: ArrowLeftRight },
];

export default function HostelOperationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold text-text-primary">Hostel Operations & Safety</h1>
        </div>
        <p className="mt-2 text-sm text-text-secondary">Operational controls for residential facilities, visitors, meals and resident movement.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {cards.map(({ title, description, icon: Icon }) => (
          <section key={title} className="rounded-card border border-surface-border bg-white p-6 shadow-card">
            <Icon className="mb-4 h-6 w-6 text-primary" />
            <h2 className="font-bold text-text-primary">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
          </section>
        ))}
      </div>

      <section className="rounded-card border border-surface-border bg-white p-6 shadow-card">
        <h2 className="font-bold text-text-primary">Operational safeguards</h2>
        <ul className="mt-4 grid gap-3 text-sm text-text-secondary md:grid-cols-2">
          <li>• Every operation is scoped to the authenticated organization and school.</li>
          <li>• A resident cannot hold two active allocations for the same academic year.</li>
          <li>• Destination beds are revalidated during transfer completion.</li>
          <li>• Visitor and inspection actions are audit logged.</li>
        </ul>
      </section>
    </div>
  );
}
