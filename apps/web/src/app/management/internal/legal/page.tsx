'use client';

import React from 'react';
import {
  Scale,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Plus,
  FileText,
  UserCheck
} from 'lucide-react';

export default function InternalLegalPage() {
  const cases = [
    { id: 'leg-1', caseNumber: 'LEG-2026-000001', title: 'Data Privacy Compliance Audit - GDPR/DPDP', type: 'COMPLIANCE', priority: 'HIGH', status: 'UNDER_REVIEW', counsel: 'Baker & McKenzie LLP', nextDate: '2026-09-15' },
    { id: 'leg-2', caseNumber: 'LEG-2026-000002', title: 'SchoolOS Trademark & IP Registration', type: 'IP', priority: 'MEDIUM', status: 'OPEN', counsel: 'In-House Legal', nextDate: '2026-09-30' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Legal & Compliance Matters</h1>
          <p className="text-text-secondary text-sm">Platform legal cases, regulatory obligations, and external counsel tracking</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Legal Matter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-background border-b border-surface-border text-xs uppercase text-text-muted font-bold">
            <tr>
              <th className="p-4">Case #</th>
              <th className="p-4">Title</th>
              <th className="p-4">Type</th>
              <th className="p-4">Priority</th>
              <th className="p-4">External Counsel</th>
              <th className="p-4">Next Action Date</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {cases.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-bold text-xs font-mono text-primary">{c.caseNumber}</td>
                <td className="p-4 font-bold text-text-primary">{c.title}</td>
                <td className="p-4 text-xs font-semibold text-text-muted">{c.type}</td>
                <td className="p-4">
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                    c.priority === 'HIGH' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {c.priority}
                  </span>
                </td>
                <td className="p-4 text-xs text-text-secondary">{c.counsel}</td>
                <td className="p-4 text-xs text-text-muted">{c.nextDate}</td>
                <td className="p-4">
                  <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
