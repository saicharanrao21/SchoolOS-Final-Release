import React from 'react';
import {
  ShieldCheck,
  Users,
  UserCheck,
  AlertTriangle,
  History,
  Activity,
  ArrowRight,
  Plus,
  QrCode,
  Bell
} from 'lucide-react';

export default function SecurityDashboard() {
  const stats = [
    { label: 'Visitors Inside', value: '12', change: '8 expected later', icon: Users, color: 'bg-blue-600' },
    { label: 'Pending Pickups', value: '42', change: 'Bus dispersal in 20m', icon: UserCheck, color: 'bg-indigo-600' },
    { label: 'Active Incidents', value: '2', change: '1 high severity', icon: AlertTriangle, color: 'bg-red-500' },
    { label: 'Gate Activity', value: '184', change: 'Last 6 hours', icon: Activity, color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Campus Security</h1>
          <p className="text-text-secondary text-sm">Monitor entry points, visitors, student release, and safety incidents</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-white border border-surface-border text-text-primary px-4 py-2.5 rounded-button font-bold text-sm hover:bg-surface-background transition-all flex items-center gap-2">
             <QrCode className="w-4 h-4" />
             Verify Pass
           </button>
           <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
             <Plus className="w-4 h-4" />
             Register Visitor
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
               <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Live Gate Activity
               </h3>
               <span className="flex items-center gap-2 text-xs font-bold text-green-500 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  LIVE FEED
               </span>
            </div>
            <div className="space-y-6">
               {[
                 { action: 'Student Pickup', person: 'Alice Johnson', gate: 'Main Gate', status: 'VERIFIED', time: '2m ago' },
                 { action: 'Visitor Entry', person: 'Robert Smith', gate: 'West Gate', status: 'CHECKED IN', time: '15m ago' },
                 { action: 'Courier Delivery', person: 'Nexus Logi.', gate: 'North Gate', status: 'COMPLETED', time: '45m ago' },
                 { action: 'Staff Exit', person: 'Mark Davis', gate: 'Main Gate', status: 'OUT', time: '1h ago' },
               ].map((log, i) => (
                 <div key={i} className="flex items-center justify-between p-4 hover:bg-surface-background rounded-xl transition-all border border-transparent hover:border-surface-border group">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-surface-background flex items-center justify-center text-text-primary font-bold text-xs">
                          {log.person.split(' ').map(n => n[0]).join('')}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">{log.person}</p>
                          <p className="text-[10px] text-text-muted font-bold uppercase">{log.action} • {log.gate}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-bold text-primary">{log.status}</p>
                       <p className="text-[10px] text-text-muted">{log.time}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="space-y-6">
            <div className="bg-white rounded-card shadow-card border border-surface-border p-6 border-l-4 border-l-red-500">
               <h3 className="font-bold text-text-primary mb-6 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-red-500" />
                  Active Incidents
               </h3>
               <div className="space-y-5">
                  {[
                    { title: 'Unauthorized Gate Entry', sev: 'CRITICAL', loc: 'South Gate' },
                    { title: 'Minor Medical Issue', sev: 'MEDIUM', loc: 'Playground' },
                  ].map((inc, i) => (
                    <div key={i} className="p-4 rounded-xl bg-red-50/30 border border-red-100">
                       <div className="flex justify-between items-start mb-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${inc.sev === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'}`}>
                             {inc.sev}
                          </span>
                          <span className="text-[10px] text-text-muted font-bold">10:42 AM</span>
                       </div>
                       <p className="text-sm font-bold text-text-primary">{inc.title}</p>
                       <p className="text-[10px] text-text-muted mt-1 uppercase font-bold tracking-tight">{inc.loc}</p>
                    </div>
                  ))}
               </div>
               <button className="w-full mt-8 py-3 text-xs font-bold text-text-muted hover:text-red-500 transition-colors border border-surface-border rounded-xl">
                  View Security Board
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
