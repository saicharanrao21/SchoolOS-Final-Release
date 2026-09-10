import React from 'react';
import {
  UserPlus,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Calendar,
  ArrowRight,
  Plus
} from 'lucide-react';

export default function PtmDashboard() {
  const stats = [
    { label: 'Total Meetings', value: '342', change: '85% completed', icon: MessageSquare, color: 'bg-blue-600' },
    { label: 'Pending Slots', value: '58', change: '24 teachers available', icon: Clock, color: 'bg-orange-500' },
    { label: 'Parent Participation', value: '92%', change: '+5% vs last PTM', icon: UserPlus, color: 'bg-indigo-600' },
    { label: 'Follow-ups', value: '12', change: 'Action items pending', icon: AlertCircle, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Parent Teacher Meetings</h1>
          <p className="text-text-secondary text-sm">Schedule and monitor institutional parent-teacher engagement</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-white border border-surface-border text-text-primary px-4 py-2.5 rounded-button font-bold text-sm hover:bg-surface-background transition-all">
             Slot Configuration
           </button>
           <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
             <Plus className="w-4 h-4" />
             Setup PTM Event
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
            <h3 className="text-lg font-bold text-text-primary mb-8 flex items-center gap-2">
               <Calendar className="w-5 h-5 text-primary" />
               Today's Schedule
            </h3>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-surface-background text-[10px] font-bold text-text-muted uppercase tracking-widest border-b border-surface-border">
                     <tr>
                        <th className="px-4 py-3">Time Slot</th>
                        <th className="px-4 py-3">Teacher</th>
                        <th className="px-4 py-3">Student / Parent</th>
                        <th className="px-4 py-3 text-center">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                     {[
                       { time: '09:00 - 09:15', teacher: 'Mr. Rajesh', parent: 'Robert J.', status: 'Completed' },
                       { time: '09:15 - 09:30', teacher: 'Ms. Priya', parent: 'Sarah W.', status: 'In Progress' },
                       { time: '09:30 - 09:45', teacher: 'Mr. David', parent: 'Alice M.', status: 'Confirmed' },
                       { time: '09:45 - 10:00', teacher: 'Ms. Anita', parent: 'Mark D.', status: 'Confirmed' },
                     ].map((ptm, i) => (
                       <tr key={i} className="hover:bg-blue-50/20 transition-colors">
                          <td className="px-4 py-4 text-sm font-bold text-primary">{ptm.time}</td>
                          <td className="px-4 py-4 text-sm font-medium text-text-primary">{ptm.teacher}</td>
                          <td className="px-4 py-4 text-sm text-text-secondary">{ptm.parent}</td>
                          <td className="px-4 py-4 text-center">
                             <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                               ptm.status === 'Completed' ? 'bg-green-100 text-green-600' :
                               ptm.status === 'In Progress' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                             }`}>
                                {ptm.status}
                             </span>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         <div className="bg-white rounded-card shadow-card border border-surface-border p-6">
            <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center justify-between">
               Teacher Utilization
               <BarChart3 className="w-5 h-5 text-text-muted" />
            </h3>
            <div className="space-y-5">
               {[
                 { name: 'Mathematics Dept.', util: 95 },
                 { name: 'Science Dept.', util: 88 },
                 { name: 'Language Dept.', util: 72 },
                 { name: 'Arts Dept.', util: 45 },
               ].map((dept, i) => (
                 <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                       <span className="text-text-primary">{dept.name}</span>
                       <span className="text-primary">{dept.util}%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-background rounded-full overflow-hidden border border-surface-border">
                       <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${dept.util}%` }}></div>
                    </div>
                 </div>
               ))}
            </div>
            <button className="w-full mt-10 py-3 text-xs font-bold text-text-muted hover:text-primary transition-colors border border-surface-border rounded-xl">
               Download Participation Report
            </button>
         </div>
      </div>
    </div>
  );
}
