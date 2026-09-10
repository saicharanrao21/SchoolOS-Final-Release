import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  ArrowUpRight,
  TrendingUp,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function AttendanceDashboard() {
  const stats = [
    { label: 'Today\'s Attendance', value: '94.2%', change: '+1.2%', icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Present', value: '1,180', change: '840 Early', icon: CheckCircle2, color: 'bg-blue-500' },
    { label: 'Absent', value: '42', change: '12 Medical', icon: XCircle, color: 'bg-red-500' },
    { label: 'Late Arrival', value: '26', change: 'Avg 15m', icon: Clock, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Attendance Command Center</h1>
          <p className="text-text-secondary text-sm">Monitor real-time student and staff presence</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-white border border-surface-border text-text-primary px-4 py-2.5 rounded-button font-bold text-sm hover:bg-surface-background transition-all">
             View Reports
           </button>
           <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
             <Calendar className="w-4 h-4" />
             School Calendar
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
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-lg font-bold text-text-primary">Attendance by Class</h3>
               <select className="text-xs font-bold text-text-muted bg-surface-background border-none outline-none rounded-lg px-3 py-1.5">
                  <option>Grade 10</option>
                  <option>Grade 9</option>
               </select>
            </div>

            <div className="space-y-6">
               {['Section A', 'Section B', 'Section C'].map((section, i) => (
                 <div key={section} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                       <span className="font-bold text-text-primary">{section}</span>
                       <span className="font-bold text-green-600">98%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-background rounded-full overflow-hidden border border-surface-border">
                       <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: i === 0 ? '98%' : i === 1 ? '92%' : '85%' }}></div>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
            <div className="p-6 border-b border-surface-border flex items-center justify-between">
               <h3 className="text-lg font-bold text-text-primary">System Alerts</h3>
               <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="p-6 space-y-6">
               <div className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5"></div>
                  <div>
                     <p className="text-sm font-bold text-text-primary">Low Attendance: Michael Chen</p>
                     <p className="text-xs text-text-muted mt-0.5">Currently at 68.5% for this term.</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5"></div>
                  <div>
                     <p className="text-sm font-bold text-text-primary">Pending Submission: Grade 7-B</p>
                     <p className="text-xs text-text-muted mt-0.5">Attendance not marked for today.</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                  <div>
                     <p className="text-sm font-bold text-text-primary">3 Correction Requests</p>
                     <p className="text-xs text-text-muted mt-0.5">Awaiting administrative review.</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
