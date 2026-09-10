import React from 'react';
import {
  ShieldCheck,
  UserCheck,
  RefreshCcw,
  Settings,
  Activity,
  History,
  TrendingUp,
  Plus,
  ArrowRight
} from 'lucide-react';

export default function AssetsDashboard() {
  const stats = [
    { label: 'Total Assets', value: '482', change: '₹1.2Cr value', icon: ShieldCheck, color: 'bg-blue-600' },
    { label: 'Assigned', value: '342', change: '71% utilization', icon: UserCheck, color: 'bg-green-500' },
    { label: 'In Repair', value: '12', change: '8 pending', icon: Settings, color: 'bg-red-500' },
    { label: 'Maintenance Due', value: '18', change: 'This month', icon: RefreshCcw, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Asset Management</h1>
          <p className="text-text-secondary text-sm">Track institutional physical assets, assignments, and maintenance</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-white border border-surface-border text-text-primary px-4 py-2.5 rounded-button font-bold text-sm hover:bg-surface-background transition-all">
             Depreciation Report
           </button>
           <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
             <Plus className="w-4 h-4" />
             Register New Asset
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-card shadow-card border border-surface-border">
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.color} p-3 rounded-xl text-white shadow-lg shadow-current/10`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest bg-surface-background px-2 py-0.5 rounded border border-surface-border">
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">{stat.label}</p>
              <p className="text-3xl font-bold text-text-primary mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white rounded-card shadow-card border border-surface-border p-8">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold text-text-primary">Upcoming Maintenance</h3>
               <Activity className="w-5 h-5 text-text-muted" />
            </div>
            <div className="space-y-4">
               {[
                 { asset: 'Dell Latitude 5420', tag: 'AST-00842', type: 'Preventive', date: 'Sept 10, 2026' },
                 { asset: 'School Bus #04', tag: 'AST-00122', type: 'Annual Service', date: 'Sept 12, 2026' },
                 { asset: 'Lab Microscope X40', tag: 'AST-00331', type: 'Calibration', date: 'Sept 15, 2026' },
                 { asset: 'Projector (Auditorium)', tag: 'AST-00512', type: 'Filter Cleaning', date: 'Sept 20, 2026' },
               ].map((m, i) => (
                 <div key={i} className="flex items-center justify-between p-4 border border-surface-border rounded-xl hover:border-primary/20 transition-all group">
                    <div className="flex gap-4">
                       <div className="w-10 h-10 rounded-lg bg-surface-background flex items-center justify-center text-primary">
                          <Settings className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">{m.asset}</p>
                          <p className="text-[10px] text-text-muted font-bold uppercase">{m.tag} • {m.type}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-bold text-text-primary">{m.date}</p>
                       <p className="text-[10px] text-text-muted font-bold uppercase">Scheduled</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="bg-white rounded-card shadow-card border border-surface-border p-6 overflow-hidden">
            <h3 className="text-lg font-bold text-text-primary mb-6">Condition Summary</h3>
            <div className="space-y-6">
               {[
                 { label: 'New/Excellent', count: 240, color: 'bg-green-500' },
                 { label: 'Good', count: 180, color: 'bg-blue-500' },
                 { label: 'Fair/Worn', count: 42, color: 'bg-orange-500' },
                 { label: 'Poor/Damaged', count: 20, color: 'bg-red-500' },
               ].map((item, i) => (
                 <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                       <span className="text-text-primary">{item.label}</span>
                       <span className="text-text-muted">{item.count}</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-background rounded-full overflow-hidden">
                       <div className={`${item.color} h-full`} style={{ width: `${(item.count/482)*100}%` }}></div>
                    </div>
                 </div>
               ))}
            </div>
            <button className="w-full mt-10 py-3 text-xs font-bold text-text-muted hover:text-primary transition-colors border border-surface-border rounded-xl">
               View Asset Register
            </button>
         </div>
      </div>
    </div>
  );
}
