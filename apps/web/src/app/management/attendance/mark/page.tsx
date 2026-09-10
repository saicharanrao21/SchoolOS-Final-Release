'use client';

import React, { useState } from 'react';
import {
  Check,
  X,
  Clock,
  Users,
  Search,
  ChevronRight,
  Lock,
  Undo2,
  Calendar as CalendarIcon
} from 'lucide-react';

export default function MarkAttendancePage() {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  const students = [
    { id: '1', name: 'Alice Johnson', roll: '10-A-01', status: 'PRESENT' },
    { id: '2', name: 'Michael Chen', roll: '10-A-02', status: 'PRESENT' },
    { id: '3', name: 'Sarah Williams', roll: '10-A-03', status: 'ABSENT' },
    { id: '4', name: 'James Wilson', roll: '10-A-04', status: 'PRESENT' },
    { id: '5', name: 'Emily Davis', roll: '10-A-05', status: 'LATE' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Daily Attendance</h1>
          <p className="text-text-secondary text-sm">Efficiently mark and review class presence</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-surface-border shadow-sm">
           <CalendarIcon className="w-4 h-4 text-primary" />
           <span className="text-sm font-bold text-text-primary">September 01, 2026</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <select className="bg-white px-4 py-3 rounded-xl border border-surface-border outline-none font-bold text-sm text-text-primary focus:ring-2 focus:ring-primary/20">
            <option>Select Grade</option>
            <option>Grade 10</option>
            <option>Grade 9</option>
         </select>
         <select className="bg-white px-4 py-3 rounded-xl border border-surface-border outline-none font-bold text-sm text-text-primary focus:ring-2 focus:ring-primary/20">
            <option>Select Section</option>
            <option>Section A</option>
            <option>Section B</option>
         </select>
         <div className="md:col-span-2 flex gap-3">
            <button className="flex-1 bg-surface-background border border-surface-border text-text-primary py-3 rounded-xl font-bold text-sm hover:bg-white transition-all shadow-sm">
               Mark All Present
            </button>
            <button className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center justify-center gap-2">
               <Lock className="w-4 h-4" />
               Submit & Lock
            </button>
         </div>
      </div>

      <div className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-surface-background text-text-muted text-[10px] font-bold uppercase tracking-widest border-b border-surface-border">
            <tr>
              <th className="px-8 py-4">Roll No.</th>
              <th className="px-8 py-4">Student Name</th>
              <th className="px-8 py-4 text-center">Status</th>
              <th className="px-8 py-4">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-blue-50/20 transition-colors">
                <td className="px-8 py-5">
                   <span className="font-mono text-xs font-bold text-text-muted bg-surface-background px-2 py-1 rounded border border-surface-border">
                     {student.roll}
                   </span>
                </td>
                <td className="px-8 py-5">
                   <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-[10px]">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-bold text-text-primary">{student.name}</span>
                   </div>
                </td>
                <td className="px-8 py-5">
                   <div className="flex items-center justify-center gap-2">
                      <button className={`p-2 rounded-lg transition-all ${student.status === 'PRESENT' ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-surface-background text-text-muted hover:bg-green-100 hover:text-green-600'}`}>
                         <Check className="w-4 h-4" />
                      </button>
                      <button className={`p-2 rounded-lg transition-all ${student.status === 'ABSENT' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-surface-background text-text-muted hover:bg-red-100 hover:text-red-600'}`}>
                         <X className="w-4 h-4" />
                      </button>
                      <button className={`p-2 rounded-lg transition-all ${student.status === 'LATE' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-surface-background text-text-muted hover:bg-orange-100 hover:text-orange-600'}`}>
                         <Clock className="w-4 h-4" />
                      </button>
                   </div>
                </td>
                <td className="px-8 py-5">
                   <input type="text" placeholder="Add optional note..." className="w-full bg-surface-background/50 border-none outline-none rounded-lg px-3 py-1.5 text-xs text-text-secondary focus:ring-1 focus:ring-primary/20" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
