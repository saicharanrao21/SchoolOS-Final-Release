import React from 'react';
import {
  FileSpreadsheet,
  GraduationCap,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Search,
  Filter,
  Plus
} from 'lucide-react';

export default function ExamsDashboard() {
  const kpis = [
    { label: 'Active Exams', value: '4', icon: Calendar, color: 'bg-blue-600' },
    { label: 'Marks Pending', value: '12', icon: Clock, color: 'bg-orange-500' },
    { label: 'Results Ready', value: '8', icon: CheckCircle2, color: 'bg-green-500' },
    { label: 'Overall Pass %', value: '88.4%', icon: TrendingUp, color: 'bg-indigo-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Examinations Command Center</h1>
          <p className="text-text-secondary text-sm">Orchestrate assessments and academic performance</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-white border border-surface-border text-text-primary px-4 py-2.5 rounded-button font-bold text-sm hover:bg-surface-background transition-all">
             Grade Rules
           </button>
           <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
             <Plus className="w-4 h-4" />
             New Examination
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
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest bg-surface-background px-2 py-0.5 rounded border border-surface-border">
                Live Status
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
               <h3 className="text-lg font-bold text-text-primary">Upcoming Examination Schedule</h3>
               <button className="text-primary text-sm font-bold hover:underline">View Calendar</button>
            </div>

            <div className="space-y-4">
               {[
                 { subject: 'Mathematics', class: 'Grade 10-A', date: 'Sept 12, 2026', time: '09:00 AM' },
                 { subject: 'Science', class: 'Grade 10-B', date: 'Sept 12, 2026', time: '09:00 AM' },
                 { subject: 'English', class: 'Grade 9-A', date: 'Sept 13, 2026', time: '10:30 AM' },
               ].map((exam, i) => (
                 <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-dashed border-surface-border hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-lg bg-surface-background flex items-center justify-center text-text-muted">
                          <FileSpreadsheet className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="font-bold text-text-primary">{exam.subject} ({exam.class})</p>
                          <p className="text-xs text-text-muted">{exam.time}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-bold text-primary">{exam.date}</p>
                       <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-0.5">Scheduled</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
            <div className="p-6 border-b border-surface-border flex items-center justify-between">
               <h3 className="text-lg font-bold text-text-primary">Quick Alerts</h3>
               <AlertCircle className="w-5 h-5 text-orange-500" />
            </div>
            <div className="p-6 space-y-6">
               <div className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0"></div>
                  <div>
                     <p className="text-sm font-bold text-text-primary">Marks Entry Overdue</p>
                     <p className="text-xs text-text-muted mt-0.5">Unit Test 1 - Mathematics Grade 8 results haven't been submitted.</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                  <div>
                     <p className="text-sm font-bold text-text-primary">4 Results for Review</p>
                     <p className="text-xs text-text-muted mt-0.5">Management approval required for Term 1 Final results.</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                  <div>
                     <p className="text-sm font-bold text-text-primary">Report Cards Generated</p>
                     <p className="text-xs text-text-muted mt-0.5">Primary Wing report cards are ready for publishing.</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
