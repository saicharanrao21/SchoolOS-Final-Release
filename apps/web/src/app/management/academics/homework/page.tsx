'use client';

import React from 'react';
import {
  BookOpen,
  FileText,
  Clock,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  Send,
  AlertCircle
} from 'lucide-react';

export default function HomeworkPage() {
  const assignments = [
    { id: '1', title: 'Calculus Derivatives Practice', subject: 'Mathematics', class: 'Grade 10-A', dueDate: 'Sept 04, 2026', submissions: 32, total: 38, status: 'PUBLISHED' },
    { id: '2', title: 'Periodic Table Elements', subject: 'Science', class: 'Grade 9-B', dueDate: 'Sept 05, 2026', submissions: 15, total: 40, status: 'PUBLISHED' },
    { id: '3', title: 'Renaissance History Essay', subject: 'History', class: 'Grade 10-B', dueDate: 'Sept 06, 2026', submissions: 0, total: 36, status: 'DRAFT' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Assignments & Homework</h1>
          <p className="text-text-secondary text-sm">Create and review academic tasks for students</p>
        </div>
        <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Assignment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search assignments by title..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-border focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium"
          />
        </div>
        <select className="bg-white px-4 py-3 rounded-xl border border-surface-border outline-none font-bold text-sm text-text-primary focus:ring-2 focus:ring-primary/20">
           <option>All Subjects</option>
           <option>Mathematics</option>
           <option>Science</option>
        </select>
        <select className="bg-white px-4 py-3 rounded-xl border border-surface-border outline-none font-bold text-sm text-text-primary focus:ring-2 focus:ring-primary/20">
           <option>All Statuses</option>
           <option>Published</option>
           <option>Draft</option>
           <option>Closed</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {assignments.map((a) => (
          <div key={a.id} className="bg-white rounded-card shadow-card border border-surface-border p-6 hover:border-primary transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
               <div className="bg-primary-light p-2 rounded-lg text-primary">
                  <BookOpen className="w-5 h-5" />
               </div>
               <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                 a.status === 'PUBLISHED' ? 'bg-green-100 text-green-600 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'
               }`}>
                 {a.status}
               </span>
            </div>
            <h3 className="font-bold text-text-primary mb-1 line-clamp-1 group-hover:text-primary transition-colors">{a.title}</h3>
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-6">{a.subject} • {a.class}</p>

            <div className="space-y-3 mb-6">
               <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted flex items-center gap-1.5 font-medium"><Clock className="w-3.5 h-3.5" /> Due {a.dueDate}</span>
                  {a.submissions === a.total ? (
                    <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Complete</span>
                  ) : (
                    <span className="text-orange-600 font-bold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {a.total - a.submissions} Pending</span>
                  )}
               </div>
               <div className="h-1.5 w-full bg-surface-background rounded-full overflow-hidden border border-surface-border">
                  <div className="h-full bg-primary transition-all duration-700" style={{ width: `${(a.submissions/a.total)*100}%` }}></div>
               </div>
            </div>

            <div className="pt-4 border-t border-surface-border flex items-center justify-between">
               <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-bold text-text-muted">S{i}</div>
                  ))}
                  <div className="w-7 h-7 rounded-full bg-surface-background border-2 border-white flex items-center justify-center text-[8px] font-bold text-text-muted">+{a.submissions-3}</div>
               </div>
               <button className="text-primary font-bold text-xs flex items-center gap-1 hover:underline">
                  Review Submissions
                  <ChevronRight className="w-4 h-4" />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
