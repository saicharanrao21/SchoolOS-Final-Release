import React from 'react';
import {
  Users,
  UserPlus,
  FileText,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Search,
  Calendar
} from 'lucide-react';

export default function AdmissionsDashboard() {
  const stats = [
    { label: 'Total Enquiries', value: '482', change: '+12%', icon: Users, color: 'bg-blue-500' },
    { label: 'Applications', value: '156', change: '+5%', icon: FileText, color: 'bg-purple-500' },
    { label: 'Interviews Today', value: '8', change: 'Live', icon: Calendar, color: 'bg-orange-500' },
    { label: 'Enrolled', value: '42', change: '+18%', icon: CheckCircle2, color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Admissions CRM</h1>
          <p className="text-text-secondary">Track leads, enquiries, and student applications</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-white border border-surface-border text-text-primary px-4 py-2.5 rounded-button font-bold text-sm hover:bg-surface-background transition-all">
             Export Report
           </button>
           <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
             <UserPlus className="w-4 h-4" />
             New Enquiry
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
              <div className={`flex items-center gap-1 text-xs font-bold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-blue-600'}`}>
                {stat.change}
                <TrendingUp className="w-3 h-3" />
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
             <h3 className="text-lg font-bold text-text-primary">Admission Funnel</h3>
             <select className="text-sm font-medium text-text-muted bg-surface-background border-none outline-none rounded-lg px-3 py-1">
               <option>Academic Year 2026-27</option>
             </select>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-text-secondary">Enquiries</span>
                <span className="text-text-primary">482</span>
              </div>
              <div className="h-3 w-full bg-surface-background rounded-full overflow-hidden border border-surface-border">
                <div className="h-full bg-blue-500 w-full"></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-text-secondary">Applications</span>
                <span className="text-text-primary">156 (32%)</span>
              </div>
              <div className="h-3 w-full bg-surface-background rounded-full overflow-hidden border border-surface-border">
                <div className="h-full bg-purple-500 w-[32%]"></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-text-secondary">Shortlisted / Approved</span>
                <span className="text-text-primary">68 (14%)</span>
              </div>
              <div className="h-3 w-full bg-surface-background rounded-full overflow-hidden border border-surface-border">
                <div className="h-full bg-indigo-500 w-[14%]"></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-text-secondary">Enrolled</span>
                <span className="text-text-primary">42 (9%)</span>
              </div>
              <div className="h-3 w-full bg-surface-background rounded-full overflow-hidden border border-surface-border">
                <div className="h-full bg-green-500 w-[9%]"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-card shadow-card border border-surface-border p-8">
          <h3 className="text-lg font-bold text-text-primary mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4 group">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-xs">
                    JD
                  </div>
                  {i < 4 && <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-surface-border group-hover:bg-primary/20 transition-colors"></div>}
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">New Application Submitted</p>
                  <p className="text-xs text-text-muted mt-0.5">Jane Doe for Grade 5</p>
                  <p className="text-[10px] text-text-muted mt-2 uppercase font-bold tracking-widest flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    2 hours ago
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
