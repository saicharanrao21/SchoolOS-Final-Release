'use client';

import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  GraduationCap,
  Sparkles,
  Send
} from 'lucide-react';

export default function ReportCardsPage() {
  const [selectedClass, setSelectedClass] = useState('Grade 10 - A');

  const reportCards = [
    { id: 'rc-1', studentName: 'Alex Johnson', admissionNo: 'ADM-2024-001', class: 'Grade 10 - A', gpa: '3.9', percentage: '92.4%', status: 'GENERATED', generatedAt: '2026-09-02' },
    { id: 'rc-2', studentName: 'Sophia Miller', admissionNo: 'ADM-2024-002', class: 'Grade 10 - A', gpa: '4.0', percentage: '96.8%', status: 'GENERATED', generatedAt: '2026-09-02' },
    { id: 'rc-3', studentName: 'Ethan Davis', admissionNo: 'ADM-2024-003', class: 'Grade 10 - A', gpa: '3.5', percentage: '84.2%', status: 'GENERATED', generatedAt: '2026-09-02' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Academic Report Cards</h1>
          <p className="text-text-secondary text-sm">Official student performance card compilation, PDF generation, and DMS storage</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Compile Class Report Cards
          </button>
        </div>
      </div>

      {/* Class Selection & Filters */}
      <div className="bg-white p-6 rounded-card shadow-card border border-surface-border flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
            <GraduationCap className="w-5 h-5 text-primary" />
            <span>Class:</span>
          </div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-surface-background border border-surface-border rounded-lg px-3 py-2 text-xs font-bold text-text-primary focus:outline-none focus:border-primary"
          >
            <option>Grade 10 - A</option>
            <option>Grade 10 - B</option>
            <option>Grade 9 - A</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button className="bg-surface-background border border-surface-border text-text-secondary px-4 py-2 rounded-lg font-bold text-xs hover:bg-slate-100 flex items-center gap-1.5">
            <Printer className="w-3.5 h-3.5" />
            Print All
          </button>
          <button className="bg-surface-background border border-surface-border text-text-secondary px-4 py-2 rounded-lg font-bold text-xs hover:bg-slate-100 flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Download ZIP
          </button>
        </div>
      </div>

      {/* Report Cards List */}
      <div className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-background border-b border-surface-border text-xs uppercase text-text-muted font-bold">
            <tr>
              <th className="p-4">Student</th>
              <th className="p-4">Admission No</th>
              <th className="p-4">Class</th>
              <th className="p-4">GPA / Score</th>
              <th className="p-4">Percentage</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {reportCards.map((rc) => (
              <tr key={rc.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-bold text-text-primary flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  {rc.studentName}
                </td>
                <td className="p-4 text-text-muted text-xs font-mono">{rc.admissionNo}</td>
                <td className="p-4 text-text-secondary font-medium text-xs">{rc.class}</td>
                <td className="p-4 font-bold text-text-primary">{rc.gpa}</td>
                <td className="p-4 font-bold text-green-600">{rc.percentage}</td>
                <td className="p-4">
                  <span className="bg-green-50 border border-green-200 text-green-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                    {rc.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-primary font-bold text-xs hover:underline flex items-center gap-1 ml-auto">
                    <Download className="w-3.5 h-3.5" />
                    View PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
