import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Wallet,
  GraduationCap,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Download
} from 'lucide-react';

export default function ExecutiveBI() {
  const kpis = [
    { label: 'Total Students', value: '4,842', trend: '+12%', up: true, icon: Users, color: 'bg-blue-600' },
    { label: 'Avg Attendance', value: '94.2%', trend: '-2%', up: false, icon: Calendar, color: 'bg-green-500' },
    { label: 'Fee Collection', value: '₹4.2Cr', trend: '+24%', up: true, icon: Wallet, color: 'bg-indigo-600' },
    { label: 'Pass Rate', value: '98.5%', trend: '+0.5%', up: true, icon: GraduationCap, color: 'bg-purple-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Executive BI Dashboard</h1>
          <p className="text-text-secondary text-sm">Institutional health and performance overview</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-white border border-surface-border text-text-primary px-4 py-2.5 rounded-button font-bold text-sm hover:bg-surface-background transition-all flex items-center gap-2">
             <Calendar className="w-4 h-4" />
             Academic Year 2026-27
           </button>
           <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
             <Download className="w-4 h-4" />
             Export Report
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white p-6 rounded-card shadow-card border border-surface-border group hover:border-primary/20 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={`${kpi.color} p-3 rounded-xl text-white shadow-lg shadow-current/10`}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${kpi.up ? 'text-green-600' : 'text-red-600'}`}>
                {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.trend}
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
               <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Revenue vs Expense Trend
               </h3>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-primary"></div>
                     <span className="text-xs font-bold text-text-muted uppercase">Revenue</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                     <span className="text-xs font-bold text-text-muted uppercase">Expense</span>
                  </div>
               </div>
            </div>
            <div className="h-64 flex items-end justify-between gap-4">
               {[45, 62, 58, 84, 72, 95, 88].map((h, i) => (
                 <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                    <div className="w-full flex items-end gap-1.5 h-full">
                       <div className="flex-1 bg-primary/20 group-hover:bg-primary transition-all rounded-t-lg" style={{ height: `${h}%` }}></div>
                       <div className="flex-1 bg-slate-100 group-hover:bg-slate-200 transition-all rounded-t-lg" style={{ height: `${h-20}%` }}></div>
                    </div>
                    <span className="text-[10px] font-bold text-text-muted uppercase">Month {i+1}</span>
                 </div>
               ))}
            </div>
         </div>

         <div className="space-y-6">
            <div className="bg-white rounded-card shadow-card border border-surface-border p-6">
               <h3 className="font-bold text-text-primary mb-6">Student Distribution</h3>
               <div className="space-y-5">
                  {[
                    { name: 'Elementary', count: 1240, color: 'bg-blue-500' },
                    { name: 'Middle School', count: 1842, color: 'bg-indigo-500' },
                    { name: 'High School', count: 1760, color: 'bg-purple-500' },
                  ].map((cat) => (
                    <div key={cat.name} className="space-y-2">
                       <div className="flex justify-between text-xs font-bold">
                          <span className="text-text-primary">{cat.name}</span>
                          <span className="text-text-muted">{cat.count}</span>
                       </div>
                       <div className="h-2 w-full bg-surface-background rounded-full overflow-hidden border border-surface-border">
                          <div className={`${cat.color} h-full transition-all duration-1000`} style={{ width: `${(cat.count/2000)*100}%` }}></div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-slate-900 rounded-card shadow-xl p-6 text-white overflow-hidden relative">
               <div className="absolute top-0 right-0 p-8 -mr-4 -mt-4 bg-white/10 rounded-full blur-3xl"></div>
               <h3 className="font-bold mb-4 flex items-center gap-2 relative z-10">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Quick Stats
               </h3>
               <div className="grid grid-cols-2 gap-6 relative z-10">
                  <div>
                     <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Teacher Ratio</p>
                     <p className="text-xl font-bold mt-1">1:24</p>
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Avg GPA</p>
                     <p className="text-xl font-bold mt-1">3.82</p>
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Inquiry Conv.</p>
                     <p className="text-xl font-bold mt-1">42%</p>
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Support Satis.</p>
                     <p className="text-xl font-bold mt-1">96%</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
