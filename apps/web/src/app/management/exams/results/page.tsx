'use client';

import React from 'react';
import {
  Download,
  Printer,
  Eye,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  ShieldCheck,
  Layout
} from 'lucide-react';

export default function ResultsPage() {
  const results = [
    { id: '1', name: 'Alice Johnson', roll: '10-A-01', percentage: '88.5%', grade: 'A', status: 'PUBLISHED' },
    { id: '2', name: 'Michael Chen', roll: '10-A-02', percentage: '72.1%', grade: 'B', status: 'PUBLISHED' },
    { id: '3', name: 'Sarah Williams', roll: '10-A-03', percentage: '91.4%', grade: 'A+', status: 'PUBLISHED' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Published Results</h1>
          <p className="text-text-secondary text-sm">Review student performance and generate report cards</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-white border border-surface-border text-text-primary px-4 py-2.5 rounded-button font-bold text-sm hover:bg-surface-background transition-all flex items-center gap-2">
             <Layout className="w-4 h-4" />
             Templates
           </button>
           <button className="bg-primary text-white px-6 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
             <Printer className="w-4 h-4" />
             Print All
           </button>
        </div>
      </div>

      <div className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
        <div className="p-4 border-b border-surface-border flex items-center justify-between gap-4 bg-surface-background/20">
           <div className="flex gap-3">
              <select className="px-4 py-2 border border-surface-border rounded-lg text-sm font-bold bg-white outline-none">
                 <option>Grade 10-A</option>
                 <option>Grade 10-B</option>
              </select>
              <select className="px-4 py-2 border border-surface-border rounded-lg text-sm font-bold bg-white outline-none">
                 <option>Term 1 Final</option>
                 <option>Unit Test 1</option>
              </select>
           </div>
           <div className="flex-1 max-w-xs relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" placeholder="Search student..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-surface-border text-sm outline-none" />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-background text-text-muted text-[10px] font-bold uppercase tracking-widest border-b border-surface-border">
              <tr>
                <th className="px-8 py-4">Roll No.</th>
                <th className="px-8 py-4">Student</th>
                <th className="px-8 py-4 text-center">Percentage</th>
                <th className="px-8 py-4 text-center">Grade</th>
                <th className="px-8 py-4 text-center">Status</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {results.map((res) => (
                <tr key={res.id} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="px-8 py-5">
                    <span className="font-mono text-xs font-bold text-text-muted">{res.roll}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-bold text-text-primary">{res.name}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="font-bold text-text-primary">{res.percentage}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary font-black text-xs mx-auto">
                      {res.grade}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold border border-green-100 flex items-center gap-1.5 w-fit mx-auto">
                      <ShieldCheck className="w-3 h-3" />
                      {res.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                       <button className="p-2 hover:bg-primary-light rounded-lg text-primary" title="View Report Card">
                          <Eye className="w-4 h-4" />
                       </button>
                       <button className="p-2 hover:bg-primary-light rounded-lg text-primary" title="Download PDF">
                          <Download className="w-4 h-4" />
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
