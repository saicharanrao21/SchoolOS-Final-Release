import React from 'react';
import {
  Calendar,
  Users,
  Trophy,
  MapPin,
  Plus,
  BarChart3,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function EventsDashboard() {
  const stats = [
    { label: 'Active Events', value: '8', change: '4 today', icon: Calendar, color: 'bg-purple-600' },
    { label: 'Registrations', value: '1,420', change: '+240 this week', icon: Users, color: 'bg-blue-500' },
    { label: 'Event Attendance', value: '88%', change: '+2% avg', icon: CheckCircle2, color: 'bg-green-500' },
    { label: 'Competitions', value: '3', change: 'Results pending', icon: Trophy, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Events & Activities</h1>
          <p className="text-text-secondary text-sm">Organize and track institutional events and student participation</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-white border border-surface-border text-text-primary px-4 py-2.5 rounded-button font-bold text-sm hover:bg-surface-background transition-all flex items-center gap-2">
             <Calendar className="w-4 h-4" />
             Calendar View
           </button>
           <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
             <Plus className="w-4 h-4" />
             Create Event
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
            <h3 className="text-lg font-bold text-text-primary mb-8 flex items-center gap-2">
               <Clock className="w-5 h-5 text-primary" />
               Upcoming Events
            </h3>
            <div className="space-y-4">
               {[
                 { title: 'Annual Sports Day 2026', date: 'Sept 15, 2026', venue: 'Main Stadium', reg: '840/1000' },
                 { title: 'Inter-School Science Fair', date: 'Sept 22, 2026', venue: 'Exhibition Hall', reg: '120/200' },
                 { title: 'Art & Craft Workshop', date: 'Oct 05, 2026', venue: 'Activity Room B', reg: '45/50' },
                 { title: 'Musical Night', date: 'Oct 12, 2026', venue: 'Auditorium', reg: '350/500' },
               ].map((event, i) => (
                 <div key={i} className="flex items-center justify-between p-4 border border-surface-border rounded-xl hover:border-primary/20 transition-all group">
                    <div className="flex gap-4">
                       <div className="w-12 h-12 rounded-lg bg-surface-background flex flex-col items-center justify-center text-primary font-bold">
                          <span className="text-[10px] uppercase leading-none">Sept</span>
                          <span className="text-lg">15</span>
                       </div>
                       <div>
                          <p className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">{event.title}</p>
                          <p className="text-xs text-text-muted flex items-center gap-1">
                             <MapPin className="w-3 h-3" />
                             {event.venue}
                          </p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-bold text-text-primary">{event.reg}</p>
                       <p className="text-[10px] text-text-muted uppercase font-bold tracking-tighter">Registered</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="bg-white rounded-card shadow-card border border-surface-border p-6">
            <h3 className="text-lg font-bold text-text-primary mb-6">Recent Results</h3>
            <div className="space-y-6">
               {[
                 { event: 'Math Olympiad', student: 'Alice W.', pos: '1st', score: '98/100' },
                 { event: 'Spelling Bee', student: 'Robert J.', pos: '2nd', score: '94/100' },
                 { event: 'Chess Finals', student: 'Mark T.', pos: '1st', score: 'W-L-D' },
               ].map((res, i) => (
                 <div key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 font-bold text-xs border border-yellow-100">
                       {res.pos}
                    </div>
                    <div>
                       <p className="text-sm font-bold text-text-primary">{res.event}</p>
                       <p className="text-[10px] text-text-muted font-bold uppercase">{res.student} • {res.score}</p>
                    </div>
                 </div>
               ))}
            </div>
            <button className="w-full mt-10 py-3 bg-surface-background text-xs font-bold text-primary rounded-xl hover:bg-primary/5 transition-all">
               Manage Awards & Results
            </button>
         </div>
      </div>
    </div>
  );
}
