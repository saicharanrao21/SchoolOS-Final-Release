'use client';

import React from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  Calendar,
  FileText,
  Settings2
} from 'lucide-react';

export default function ExaminationsPage() {
  const exams = [
    { id: '1', name: 'Term 1 Final Examination', type: 'TERM_EXAM', startDate: 'Sept 12, 2026', endDate: 'Sept 25, 2026', status: 'SCHEDULED', subjects: 12 },
    { id: '2', name: 'Unit Test 1', type: 'UNIT_TEST', startDate: 'Aug 15, 2026', endDate: 'Aug 20, 2026', status: 'COMPLETED', subjects: 8 },
    { id: '3', name: 'Monthly Practical Test', type: 'PRACTICAL', startDate: 'Oct 05, 2026', endDate: 'Oct 10, 2026', status: 'DRAFT', subjects: 4 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'COMPLETED': return 'bg-green-100 text-green-600 border-green-200';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'PUBLISHED': return 'bg-indigo-100 text-indigo-600 border-indigo-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Examinations</h1>
          <p className="text-text-secondary text-sm">Manage institutional assessment cycles and schedules</p>
        </div>
        <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Exam
        </button>
      </div>

      <div className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
        <div className="p-4 border-b border-surface-border flex items-center justify-between gap-4 bg-surface-background/20">
          <div className="flex-1 max-w-sm relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search examinations..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-border focus:ring-2 focus:ring-primary/20 outline-none text-sm"
            />
          </div>
          <div className="flex gap-2">
             <button className="p-2 border border-surface-border rounded-lg bg-white text-text-muted hover:text-primary transition-colors">
                <Filter className="w-5 h-5" />
             </button>
             <button className="p-2 border border-surface-border rounded-lg bg-white text-text-muted hover:text-primary transition-colors">
                <Settings2 className="w-5 h-5" />
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-background text-text-muted text-[10px] font-bold uppercase tracking-widest border-b border-surface-border">
              <tr>
                <th className="px-8 py-4">Exam Name</th>
                <th className="px-8 py-4">Type</th>
                <th className="px-8 py-4">Duration</th>
                <th className="px-8 py-4 text-center">Subjects</th>
                <th className="px-8 py-4 text-center">Status</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {exams.map((exam) => (
                <tr key={exam.id} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                       <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center text-primary">
                          <Calendar className="w-5 h-5" />
                       </div>
                       <span className="font-bold text-text-primary">{exam.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-widest bg-surface-background px-2 py-0.5 rounded border">
                      {exam.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm text-text-secondary font-medium">
                    {exam.startDate} - {exam.endDate}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-bold border border-blue-100">
                      {exam.subjects} Subjects
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(exam.status)}`}>
                      {exam.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                       <button className="p-2 hover:bg-primary-light rounded-lg text-primary transition-colors">
                          <ChevronRight className="w-4 h-4" />
                       </button>
                       <button className="p-2 hover:bg-surface-background rounded-full text-text-muted">
                          <MoreVertical className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
