'use client';

import React, { useState } from 'react';
import { PageHeader } from '../../../../components/common/PageHeader';
import { Card } from '../../../../components/common/Card';
import { Check, X, Clock, Lock, Calendar as CalendarIcon, Cpu } from 'lucide-react';

export default function MarkAttendancePage() {
  const [selectedClass, setSelectedClass] = useState('Grade 10');
  const [selectedSection, setSelectedSection] = useState('Section A');

  const [students, setStudents] = useState([
    { id: '1', name: 'Alice Johnson', roll: '10-A-01', status: 'PRESENT', note: '' },
    { id: '2', name: 'Michael Chen', roll: '10-A-02', status: 'PRESENT', note: '' },
    { id: '3', name: 'Sarah Williams', roll: '10-A-03', status: 'ABSENT', note: 'Medical Notice' },
    { id: '4', name: 'James Wilson', roll: '10-A-04', status: 'PRESENT', note: '' },
    { id: '5', name: 'Emily Davis', roll: '10-A-05', status: 'LATE', note: 'Traffic Delay' },
  ]);

  const updateStatus = (id: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const markAll = (status: 'PRESENT' | 'ABSENT') => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Mark Class Attendance"
        subtitle="Record daily student presence, absent notes, and automatic parent alerts"
        badge="Biometric Push Enabled"
        badgeVariant="SUCCESS"
        breadcrumbs={[
          { label: 'SchoolOS', href: '/management/dashboard' },
          { label: 'Attendance' },
          { label: 'Mark Attendance' },
        ]}
        actions={
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-surface-border text-xs font-bold shadow-xs">
            <CalendarIcon className="w-4 h-4 text-primary" />
            <span>Sept 10, 2026</span>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="bg-white px-3.5 py-2.5 rounded-xl border border-surface-border text-xs font-bold text-text-primary focus:outline-none"
        >
          <option value="Grade 10">Grade 10</option>
          <option value="Grade 9">Grade 9</option>
        </select>

        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="bg-white px-3.5 py-2.5 rounded-xl border border-surface-border text-xs font-bold text-text-primary focus:outline-none"
        >
          <option value="Section A">Section A</option>
          <option value="Section B">Section B</option>
        </select>

        <button
          onClick={() => markAll('PRESENT')}
          className="bg-white border border-surface-border hover:bg-surface-hover text-text-primary rounded-xl font-bold text-xs py-2.5 shadow-2xs"
        >
          Mark All Present
        </button>

        <button className="bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs py-2.5 shadow-sm flex items-center justify-center gap-2 active:scale-95">
          <Lock className="w-4 h-4" /> Submit & Lock Session
        </button>
      </div>

      <Card title={`Attendance Grid (${selectedClass} - ${selectedSection})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-background border-b border-surface-border text-[10px] font-bold uppercase tracking-wider text-text-muted">
              <tr>
                <th className="px-4 py-3">Roll No</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3">Note / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-surface-hover/80 font-medium">
                  <td className="px-4 py-3">
                    <span className="font-bold text-text-primary">{student.roll}</span>
                  </td>
                  <td className="px-4 py-3 font-bold text-text-primary">{student.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => updateStatus(student.id, 'PRESENT')}
                        className={`p-1.5 rounded-lg transition-all ${
                          student.status === 'PRESENT' ? 'bg-green-600 text-white shadow-xs' : 'bg-slate-100 text-slate-400 hover:text-green-600'
                        }`}
                        title="Present"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateStatus(student.id, 'ABSENT')}
                        className={`p-1.5 rounded-lg transition-all ${
                          student.status === 'ABSENT' ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 text-slate-400 hover:text-red-600'
                        }`}
                        title="Absent"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateStatus(student.id, 'LATE')}
                        className={`p-1.5 rounded-lg transition-all ${
                          student.status === 'LATE' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-400 hover:text-amber-600'
                        }`}
                        title="Late"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={student.note}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStudents((prev) => prev.map((s) => (s.id === student.id ? { ...s, note: val } : s)));
                      }}
                      placeholder="Add optional remark..."
                      className="w-full bg-surface-background border border-surface-border rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
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
