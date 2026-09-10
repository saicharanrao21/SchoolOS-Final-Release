import React from 'react';
import {
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Banknote,
  FileText,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function AccountingDashboard() {
  const kpis = [
    { label: 'Total Revenue', value: '₹12.4M', trend: '+5.2%', icon: BarChart3, color: 'bg-blue-600' },
    { label: 'Total Expenses', value: '₹8.2M', trend: '+2.1%', icon: PieChart, color: 'bg-red-500' },
    { label: 'Cash on Hand', value: '₹425K', trend: '-1.5%', icon: Banknote, color: 'bg-green-500' },
    { label: 'Bank Balance', value: '₹4.8M', trend: '+12%', icon: Wallet, color: 'bg-indigo-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Accounting Command Center</h1>
          <p className="text-text-secondary text-sm font-medium mt-1 uppercase tracking-widest opacity-70">Double-Entry Financial Management</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-white border border-surface-border text-text-primary px-4 py-2.5 rounded-button font-bold text-sm hover:bg-surface-background transition-all">
             Export Data
           </button>
           <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
             <FileText className="w-4 h-4" />
             New Journal Entry
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white p-6 rounded-card shadow-card border border-surface-border transition-all hover:border-primary/20">
            <div className="flex justify-between items-start mb-4">
              <div className={`${kpi.color} p-3 rounded-xl text-white shadow-lg shadow-current/10`}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${kpi.trend.startsWith('+') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} px-2 py-0.5 rounded-full`}>
                {kpi.trend}
                {kpi.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">{kpi.label}</p>
              <p className="text-3xl font-bold text-text-primary mt-1">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white rounded-card shadow-card border border-surface-border p-8">
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-lg font-bold text-text-primary">Net Profit Trend</h3>
               <div className="flex gap-2">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-text-muted uppercase"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Current Year</span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-text-muted uppercase"><span className="w-2 h-2 rounded-full bg-slate-300"></span> Previous Year</span>
               </div>
            </div>

            <div className="h-64 w-full flex items-end justify-between px-4">
               {[60, 45, 80, 55, 90, 70, 85, 40, 65, 95, 75, 50].map((h, i) => (
                 <div key={i} className="w-8 flex flex-col items-center gap-2 group">
                    <div className="w-full bg-slate-100 rounded-t-md h-[40%]"></div>
                    <div className="w-full bg-blue-500 rounded-t-md transition-all group-hover:bg-blue-600 cursor-pointer" style={{ height: `${h}%` }}></div>
                    <span className="text-[9px] font-bold text-text-muted uppercase">P{i+1}</span>
                 </div>
               ))}
            </div>
         </div>

         <div className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
            <div className="p-6 border-b border-surface-border">
               <h3 className="text-lg font-bold text-text-primary">System Health</h3>
            </div>
            <div className="p-6 space-y-6">
               <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-secondary">Trial Balance</span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Balanced
                  </span>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-secondary">Open Fiscal Year</span>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">FY 2026-27</span>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-secondary">Pending Postings</span>
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">12 Drafts</span>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-secondary">Last Bank Recon</span>
                  <span className="text-xs font-bold text-text-muted bg-surface-background px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 2 days ago
                  </span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
