'use client';

import React from 'react';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Plus,
  Filter,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  ChevronRight,
  History
} from 'lucide-react';

export default function TimetablesPage() {
  const timetables = [
    { id: '1', name: 'Grade 10-A Timetable', academicYear: '2026-27', class: 'Grade 10', section: 'A', status: 'PUBLISHED', version: 2 },
    { id: '2', name: 'Grade 10-B Timetable', academicYear: '2026-27', class: 'Grade 10', section: 'B', status: 'DRAFT', version: 1 },
    { id: '3', name: 'Grade 9-A Timetable', academicYear: '2026-27', class: 'Grade 9', section: 'A', status: 'PUBLISHED', version: 1 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Academic Timetables</h1>
          <p className="text-text-secondary text-sm">Schedule and manage institutional learning sessions</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-white border border-surface-border text-text-primary px-4 py-2.5 rounded-button font-bold text-sm hover:bg-surface-background transition-all flex items-center gap-2">
             <History className="w-4 h-4" />
             Substitutions
           </button>
           <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
             <Plus className="w-4 h-4" />
             Create Timetable
           </button>
        </div>
      </div>

      <div className="bg-white rounded-card shadow-card border border-surface-border p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-text-primary">Schedule Integrity Engine</h2>
            <p className="text-xs text-text-muted mt-1">Teacher, room, section and availability conflicts are checked before publication.</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-700">Pre-publish validation</span>
            <span className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-700">Version cloning</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-card shadow-card border border-surface-border">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <Calendar className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-text-muted">Published Timetables</p>
          </div>
          <p className="text-3xl font-bold text-text-primary">24</p>
        </div>
        <div className="bg-white p-6 rounded-card shadow-card border border-surface-border">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-text-muted">Draft Versions</p>
          </div>
          <p className="text-3xl font-bold text-text-primary">12</p>
        </div>
        <div className="bg-white p-6 rounded-card shadow-card border border-surface-border">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-green-100 p-2 rounded-lg text-green-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-text-muted">Coverage Ratio</p>
          </div>
          <p className="text-3xl font-bold text-text-primary">98.5%</p>
        </div>
      </div>

      <div className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
        <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-background/20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-bold text-text-muted px-3 py-1.5 bg-white rounded-lg border">
              <Filter className="w-4 h-4" />
              All Classes
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-background text-text-muted text-[10px] font-bold uppercase tracking-widest border-b border-surface-border">
              <tr>
                <th className="px-8 py-4">Timetable Name</th>
                <th className="px-8 py-4">Class / Section</th>
                <th className="px-8 py-4">Current Version</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {timetables.map((t) => (
                <tr key={t.id} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-text-primary">{t.name}</span>
                      <span className="text-xs text-text-muted">{t.academicYear}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-medium text-text-secondary">{t.class} - {t.section}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-2 py-1 bg-surface-background border rounded text-xs font-bold text-text-primary">v{t.version}.0</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                      t.status === 'PUBLISHED' ? 'bg-green-100 text-green-600 border-green-200' : 'bg-yellow-100 text-yellow-600 border-yellow-200'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
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
