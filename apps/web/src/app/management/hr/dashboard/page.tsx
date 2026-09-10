import React from 'react';
import {
  Users,
  UserPlus,
  Briefcase,
  Calendar,
  Clock,
  FileText,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Activity
} from 'lucide-react';

export default function HrDashboard() {
  const stats = [
    { label: 'Total Employees', value: '142', change: '+4 this month', icon: Users, color: 'bg-blue-600' },
    { label: 'Active Teachers', value: '84', change: '92% availability', icon: Briefcase, color: 'bg-indigo-600' },
    { label: 'On Leave Today', value: '8', change: '2 pending approval', icon: Calendar, color: 'bg-orange-500' },
    { label: 'Probation', value: '12', change: 'Reviews due', icon: Clock, color: 'bg-purple-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">HR Command Center</h1>
          <p className="text-text-secondary text-sm">Manage institutional staff, lifecycle, and compliance</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-white border border-surface-border text-text-primary px-4 py-2.5 rounded-button font-bold text-sm hover:bg-surface-background transition-all flex items-center gap-2">
             <FileText className="w-4 h-4" />
             Staff Directory
           </button>
           <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
             <UserPlus className="w-4 h-4" />
             Onboard Employee
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
              <div className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
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
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-lg font-bold text-text-primary">Department Distribution</h3>
               <Activity className="w-5 h-5 text-text-muted" />
            </div>

            <div className="space-y-8">
               {[
                 { name: 'Academic (Teachers)', count: 84, total: 142, color: 'bg-blue-500' },
                 { name: 'Administration', count: 18, total: 142, color: 'bg-indigo-500' },
                 { name: 'Transport & Support', count: 24, total: 142, color: 'bg-purple-500' },
                 { name: 'Security & Maintenance', count: 16, total: 142, color: 'bg-slate-500' },
               ].map((dept) => (
                 <div key={dept.name} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                       <span className="font-bold text-text-primary">{dept.name}</span>
                       <span className="text-xs text-text-muted font-medium">{dept.count} Staff</span>
                    </div>
                    <div className="h-2 w-full bg-surface-background rounded-full overflow-hidden border border-surface-border">
                       <div className={`${dept.color} h-full transition-all duration-1000`} style={{ width: `${(dept.count/dept.total)*100}%` }}></div>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="space-y-6">
            <div className="bg-white rounded-card shadow-card border border-surface-border p-6">
               <h3 className="font-bold text-text-primary mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Upcoming Expiries
               </h3>
               <div className="space-y-4">
                  {[
                    { item: 'Contract Renewal', staff: 'Robert Smith', date: 'in 4 days', type: 'contract' },
                    { item: 'License Expiry', staff: 'David Miller', date: 'in 12 days', type: 'document' },
                    { item: 'Passport Verification', staff: 'Sarah Wilson', date: 'in 15 days', type: 'document' },
                  ].map((expiry, i) => (
                    <div key={i} className="flex items-center justify-between group">
                       <div>
                          <p className="text-sm font-bold text-text-primary">{expiry.staff}</p>
                          <p className="text-[10px] text-text-muted font-bold uppercase">{expiry.item}</p>
                       </div>
                       <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">{expiry.date}</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
