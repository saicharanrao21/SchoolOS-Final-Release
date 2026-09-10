import React from 'react';
import {
  Home,
  Hotel,
  UserCheck,
  LogOut,
  AlertTriangle,
  Users,
  Activity,
  ArrowRight,
  Plus
} from 'lucide-react';

export default function HostelDashboard() {
  const stats = [
    { label: 'Total Residents', value: '842', change: '92% occupancy', icon: Users, color: 'bg-indigo-600' },
    { label: 'Available Beds', value: '58', change: '8 Blocks', icon: Hotel, color: 'bg-green-500' },
    { label: 'Active Outpasses', value: '24', change: '5 Overdue', icon: LogOut, color: 'bg-orange-500' },
    { label: 'Safety Incidents', value: '2', change: 'Last 7 days', icon: AlertTriangle, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Hostel Management</h1>
          <p className="text-text-secondary text-sm">Oversee residential facilities and student welfare</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-white border border-surface-border text-text-primary px-4 py-2.5 rounded-button font-bold text-sm hover:bg-surface-background transition-all">
             Night Attendance
           </button>
           <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
             <Plus className="w-4 h-4" />
             New Allocation
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-card shadow-card border border-surface-border transition-all hover:border-primary/20">
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
               <h3 className="text-lg font-bold text-text-primary">Occupancy by Block</h3>
               <Activity className="w-5 h-5 text-text-muted" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {[
                 { name: 'Block A (Boys)', used: 120, total: 120, color: 'bg-blue-500' },
                 { name: 'Block B (Boys)', used: 110, total: 120, color: 'bg-blue-500' },
                 { name: 'Block C (Girls)', used: 100, total: 100, color: 'bg-pink-500' },
                 { name: 'Block D (Girls)', used: 85, total: 100, color: 'bg-pink-500' },
               ].map((block, i) => (
                 <div key={i} className="p-4 border border-surface-border rounded-xl space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="text-sm font-bold text-text-primary">{block.name}</span>
                       <span className="text-xs font-bold text-text-muted">{block.used}/{block.total}</span>
                    </div>
                    <div className="h-2 w-full bg-surface-background rounded-full overflow-hidden">
                       <div className={`${block.color} h-full`} style={{ width: `${(block.used/block.total)*100}%` }}></div>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="bg-white rounded-card shadow-card border border-surface-border p-6 overflow-hidden">
            <h3 className="text-lg font-bold text-text-primary mb-6">Recent Outpasses</h3>
            <div className="space-y-4">
               {[
                 { name: 'David Miller', room: 'A-204', type: 'Weekend', status: 'Approved' },
                 { name: 'James Wilson', room: 'B-105', type: 'Medical', status: 'Pending' },
                 { name: 'Emily Chen', room: 'C-302', type: 'Local', status: 'Returned' },
                 { name: 'Sarah Lee', room: 'D-401', type: 'Weekend', status: 'Departed' },
               ].map((op, i) => (
                 <div key={i} className="flex items-center justify-between p-3 hover:bg-surface-background rounded-xl transition-all group">
                    <div>
                       <p className="text-sm font-bold text-text-primary">{op.name}</p>
                       <p className="text-[10px] text-text-muted font-bold uppercase">{op.room} • {op.type}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                      op.status === 'Approved' ? 'text-green-600 bg-green-50' :
                      op.status === 'Pending' ? 'text-yellow-600 bg-yellow-50' : 'text-blue-600 bg-blue-50'
                    }`}>
                      {op.status}
                    </span>
                 </div>
               ))}
            </div>
            <button className="w-full mt-6 py-3 text-xs font-bold text-primary border-t border-surface-border hover:underline">
               View All Outpasses
            </button>
         </div>
      </div>
    </div>
  );
}
