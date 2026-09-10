'use client';

import React, { useState } from 'react';
import { PageHeader } from '../../../../components/common/PageHeader';
import { Card } from '../../../../components/common/Card';
import { FilterBar } from '../../../../components/common/FilterBar';
import { Save, Send, GraduationCap } from 'lucide-react';

export default function MarkEntryGridPage() {
  const [search, setSearch] = useState('');

  const [students, setStudents] = useState([
    { id: '1', name: 'Alice Johnson', roll: '10-A-01', theory: 78, practical: 18, internal: 9 },
    { id: '2', name: 'Michael Chen', roll: '10-A-02', theory: 65, practical: 15, internal: 8 },
    { id: '3', name: 'Sarah Williams', roll: '10-A-03', theory: 82, practical: 19, internal: 10 },
    { id: '4', name: 'James Wilson', roll: '10-A-04', theory: 54, practical: 14, internal: 7 },
  ]);

  const updateMarks = (id: string, field: 'theory' | 'practical' | 'internal', value: number) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const filtered = students.filter((s) =>
    `${s.name} ${s.roll}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Marks & Assessment Entry Workbench"
        subtitle="Term 1 Final • Mathematics • Grade 10-A"
        badge="Lock Available"
        badgeVariant="INFO"
        breadcrumbs={[
          { label: 'SchoolOS', href: '/management/dashboard' },
          { label: 'Examinations' },
          { label: 'Marks Entry' },
        ]}
        actions={
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-white border border-surface-border hover:bg-surface-hover text-text-primary px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm">
              <Save className="w-4 h-4 text-primary" /> Save Draft
            </button>
            <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95">
              <Send className="w-4 h-4" /> Submit & Publish Marks
            </button>
          </div>
        }
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter student name or roll number..."
      />

      <Card
        title="Marks Evaluation Grid"
        action={
          <span className="flex items-center gap-1.5 text-xs font-bold text-primary bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            <GraduationCap className="w-3.5 h-3.5" /> Max Marks: Theory (80), Practical (20), Internal (10)
          </span>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-background border-b border-surface-border text-[10px] font-bold uppercase tracking-wider text-text-muted">
              <tr>
                <th className="px-4 py-3">Roll No</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3 text-center">Theory (80)</th>
                <th className="px-4 py-3 text-center">Practical (20)</th>
                <th className="px-4 py-3 text-center">Internal (10)</th>
                <th className="px-4 py-3 text-right">Total Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border font-medium text-text-primary">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-surface-hover/80">
                  <td className="px-4 py-3 font-bold text-text-muted">{s.roll}</td>
                  <td className="px-4 py-3 font-bold text-text-primary">{s.name}</td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      value={s.theory}
                      onChange={(e) => updateMarks(s.id, 'theory', Number(e.target.value))}
                      className="w-16 bg-surface-background border border-surface-border rounded-lg px-2 py-1 text-center font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      value={s.practical}
                      onChange={(e) => updateMarks(s.id, 'practical', Number(e.target.value))}
                      className="w-16 bg-surface-background border border-surface-border rounded-lg px-2 py-1 text-center font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      value={s.internal}
                      onChange={(e) => updateMarks(s.id, 'internal', Number(e.target.value))}
                      className="w-16 bg-surface-background border border-surface-border rounded-lg px-2 py-1 text-center font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-primary">
                    {s.theory + s.practical + s.internal} / 110
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
