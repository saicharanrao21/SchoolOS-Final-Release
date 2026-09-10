import React from 'react';
import { Users, Wallet, CheckCircle2, GitBranch } from 'lucide-react';

export function KpiSummaryWidget() {
  const kpis = [
    { label: 'Total Active Students', value: '2,840', change: '+4.2%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Fee Collection (Term)', value: '$1.42M', change: '88% Billed', icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Today Attendance Rate', value: '96.4%', change: '2,738 Present', icon: CheckCircle2, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
    { label: 'Pending Approvals', value: '14', change: 'Action Required', icon: GitBranch, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="bg-white p-5 rounded-2xl border border-surface-border shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">{kpi.label}</span>
            <div className={`p-2.5 rounded-xl border ${kpi.bg} ${kpi.color}`}>
              <kpi.icon className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary tracking-tight">{kpi.value}</div>
            <div className="text-[11px] font-semibold text-text-secondary mt-1">{kpi.change}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
