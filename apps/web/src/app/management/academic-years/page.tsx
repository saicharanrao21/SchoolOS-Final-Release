import React from 'react';
import { Plus, Calendar, CheckCircle2, Clock, Lock, MoreVertical } from 'lucide-react';

export default function AcademicYearsPage() {
  const years = [
    { name: '2026-27', start: 'Aug 15, 2026', end: 'Jun 10, 2027', status: 'ACTIVE', isCurrent: true },
    { name: '2025-26', start: 'Aug 15, 2025', end: 'Jun 10, 2026', status: 'CLOSED', isCurrent: false },
    { name: '2027-28', start: 'Aug 15, 2027', end: 'Jun 10, 2028', status: 'DRAFT', isCurrent: false },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-600';
      case 'CLOSED': return 'bg-slate-100 text-slate-600';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Academic Years</h1>
          <p className="text-text-secondary">Define and manage institutional cycles</p>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-button font-bold transition-all shadow-md active:scale-95">
          <Plus className="w-5 h-5" />
          <span>New Session</span>
        </button>
      </div>

      <div className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-surface-background text-text-muted text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Academic Year</th>
              <th className="px-6 py-4">Duration</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Current</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {years.map((year) => (
              <tr key={year.name} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center text-primary">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-text-primary text-lg">{year.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-text-primary">{year.start} - {year.end}</span>
                    <span className="text-xs text-text-muted">10 months</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusStyle(year.status)}`}>
                    {year.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {year.isCurrent ? (
                    <div className="flex items-center gap-1.5 text-primary">
                      <CheckCircle2 className="w-5 h-5 fill-primary text-white" />
                      <span className="text-sm font-bold">Default</span>
                    </div>
                  ) : (
                    <button className="text-xs font-bold text-text-muted hover:text-primary transition-colors uppercase tracking-widest">Set Current</button>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-surface-background rounded-full text-text-muted transition-colors">
                    <MoreVertical className="w-5 h-5" />
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
