'use client';

import React from 'react';
import {
  Check,
  X,
  Search,
  Filter,
  Save,
  Send,
  ChevronRight,
  User,
  GraduationCap
} from 'lucide-react';

export default function MarkEntryPage() {
  const students = [
    { id: '1', name: 'Alice Johnson', roll: '10-A-01', theory: 78, practical: 18, internal: 9 },
    { id: '2', name: 'Michael Chen', roll: '10-A-02', theory: 65, practical: 15, internal: 8 },
    { id: '3', name: 'Sarah Williams', roll: '10-A-03', theory: 82, practical: 19, internal: 10 },
    { id: '4', name: 'James Wilson', roll: '10-A-04', theory: 54, practical: 14, internal: 7 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Marks Entry</h1>
          <p className="text-text-secondary text-sm font-medium opacity-70">Term 1 Final • Mathematics • Grade 10-A</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-white border border-surface-border text-text-primary px-5 py-2.5 rounded-button font-bold text-sm hover:bg-surface-background transition-all flex items-center gap-2">
             <Save className="w-4 h-4" />
             Save Draft
           </button>
           <button className="bg-primary text-white px-6 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
             <Send className="w-4 h-4" />
             Submit Marks
           </button>
        </div>
      </div>

      <div className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
        <div className="p-4 border-b border-surface-border grid grid-cols-1 md:grid-cols-4 gap-4 bg-surface-background/10">
           <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" placeholder="Filter by roll or name..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-surface-border text-sm outline-none focus:ring-2 focus:ring-primary/20" />
           </div>
           <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 text-xs font-bold">
              <GraduationCap className="w-4 h-4" /> Max Marks: Theory (80), Pract. (20)
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-background text-text-muted text-[10px] font-bold uppercase tracking-widest border-b border-surface-border">
              <tr>
                <th className="px-8 py-4">Roll No.</th>
                <th className="px-8 py-4">Student</th>
                <th className="px-8 py-4 text-center">Theory (80)</th>
                <th className="px-8 py-4 text-center">Practical (20)</th>
                <th className="px-8 py-4 text-center">Internal (10)</th>
                <th className="px-8 py-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-blue-50/10 transition-colors">
                  <td className="px-8 py-5">
                    <span className="font-mono text-xs font-bold text-text-muted bg-surface-background px-2 py-1 rounded">{student.roll}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-text-muted">
                          <User className="w-4 h-4" />
                       </div>
                       <span className="font-bold text-text-primary">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                     <input type="number" defaultValue={student.theory} className="w-20 mx-auto block text-center py-1.5 rounded-lg border border-surface-border focus:border-primary outline-none text-sm font-bold text-text-primary" />
                  </td>
                  <td className="px-8 py-5">
                     <input type="number" defaultValue={student.practical} className="w-20 mx-auto block text-center py-1.5 rounded-lg border border-surface-border focus:border-primary outline-none text-sm font-bold text-text-primary" />
                  </td>
                  <td className="px-8 py-5">
                     <input type="number" defaultValue={student.internal} className="w-20 mx-auto block text-center py-1.5 rounded-lg border border-surface-border focus:border-primary outline-none text-sm font-bold text-text-primary" />
                  </td>
                  <td className="px-8 py-5 text-right font-bold text-text-primary">
                    {student.theory + student.practical + student.internal}
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
