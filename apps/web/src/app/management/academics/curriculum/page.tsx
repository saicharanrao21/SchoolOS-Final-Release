'use client';

import React from 'react';
import {
  Library,
  BookMarked,
  Layers,
  Plus,
  Search,
  MoreVertical,
  ChevronRight,
  FileText
} from 'lucide-react';

export default function CurriculumPage() {
  const curriculums = [
    { id: '1', title: 'CBSE Mathematics Standard', subject: 'Mathematics', class: 'Grade 10', year: '2026-27', units: 12, status: 'PUBLISHED' },
    { id: '2', title: 'Advance Physics Curriculum', subject: 'Physics', class: 'Grade 12', year: '2026-27', units: 8, status: 'DRAFT' },
    { id: '3', title: 'Primary English Literacy', subject: 'English', class: 'Grade 5', year: '2026-27', units: 15, status: 'PUBLISHED' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Curriculum Management</h1>
          <p className="text-text-secondary text-sm">Define syllabus structure and learning objectives</p>
        </div>
        <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Curriculum
        </button>
      </div>

      <div className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
        <div className="p-4 border-b border-surface-border flex items-center justify-between gap-4 bg-surface-background/20">
          <div className="flex-1 max-w-sm relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search curriculum..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-border focus:ring-2 focus:ring-primary/20 outline-none text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-background text-text-muted text-[10px] font-bold uppercase tracking-widest border-b border-surface-border">
              <tr>
                <th className="px-8 py-4">Title</th>
                <th className="px-8 py-4">Subject / Class</th>
                <th className="px-8 py-4 text-center">Units</th>
                <th className="px-8 py-4 text-center">Status</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {curriculums.map((c) => (
                <tr key={c.id} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                       <div className="bg-primary-light p-2 rounded-lg text-primary">
                          <BookMarked className="w-4 h-4" />
                       </div>
                       <div className="flex flex-col">
                          <span className="font-bold text-text-primary">{c.title}</span>
                          <span className="text-xs text-text-muted">{c.year}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                       <span className="text-sm font-bold text-text-secondary">{c.subject}</span>
                       <span className="text-xs text-text-muted">{c.class}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="font-mono text-xs font-bold text-text-primary px-2 py-1 bg-surface-background rounded border">{c.units}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                      c.status === 'PUBLISHED' ? 'bg-green-100 text-green-600 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                       <button className="p-2 hover:bg-primary-light rounded-lg text-primary">
                          <ChevronRight className="w-4 h-4" />
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
