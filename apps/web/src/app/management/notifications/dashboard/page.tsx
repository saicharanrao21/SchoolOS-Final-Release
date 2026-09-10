import React from 'react';
import {
  Bell,
  Send,
  MessageSquare,
  Mail,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Activity,
  History,
  Settings2,
  Plus
} from 'lucide-react';

export default function NotificationsDashboard() {
  const stats = [
    { label: 'Total Sent', value: '24.5K', change: '+12%', icon: Send, color: 'bg-blue-600' },
    { label: 'Delivery Rate', value: '98.2%', change: '+0.5%', icon: Activity, color: 'bg-green-500' },
    { label: 'Failed', value: '142', change: '-5%', icon: AlertCircle, color: 'bg-red-500' },
    { label: 'Active Devices', value: '1,240', change: '+8%', icon: Smartphone, color: 'bg-indigo-600' },
  ];

  const channels = [
    { name: 'WhatsApp', sent: 8400, delivered: 8250, failed: 150, color: 'bg-green-500' },
    { name: 'SMS', sent: 4200, delivered: 4100, failed: 100, color: 'bg-blue-500' },
    { name: 'Email', sent: 6800, delivered: 6750, failed: 50, color: 'bg-orange-500' },
    { name: 'Push', sent: 5100, delivered: 5050, failed: 50, color: 'bg-indigo-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Notification Command Center</h1>
          <p className="text-text-secondary text-sm">Monitor multi-channel delivery and system communication</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-white border border-surface-border text-text-primary px-4 py-2.5 rounded-button font-bold text-sm hover:bg-surface-background transition-all flex items-center gap-2">
             <Settings2 className="w-4 h-4" />
             Providers
           </button>
           <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
             <Plus className="w-4 h-4" />
             New Announcement
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
               <h3 className="text-lg font-bold text-text-primary">Channel Distribution</h3>
               <BarChart3 className="w-5 h-5 text-text-muted" />
            </div>

            <div className="space-y-8">
               {channels.map((ch) => (
                 <div key={ch.name} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                       <span className="font-bold text-text-primary">{ch.name}</span>
                       <span className="text-xs text-text-muted font-medium">Delivered: {ch.delivered} / {ch.sent}</span>
                    </div>
                    <div className="h-2.5 w-full bg-surface-background rounded-full overflow-hidden border border-surface-border flex">
                       <div className={`${ch.color} h-full transition-all duration-1000`} style={{ width: `${(ch.delivered/ch.sent)*100}%` }}></div>
                       <div className="bg-red-500 h-full transition-all duration-1000" style={{ width: `${(ch.failed/ch.sent)*100}%` }}></div>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
            <div className="p-6 border-b border-surface-border flex items-center justify-between">
               <h3 className="text-lg font-bold text-text-primary">Recent History</h3>
               <History className="w-5 h-5 text-text-muted" />
            </div>
            <div className="p-6 space-y-6">
               {[
                 { event: 'student.absent', recipient: 'Robert J.', channel: 'WhatsApp', time: '2m ago' },
                 { event: 'fee.issued', recipient: 'Alice W.', channel: 'Push', time: '15m ago' },
                 { event: 'payment.received', recipient: 'Mark T.', channel: 'Email', time: '45m ago' },
                 { event: 'exam.scheduled', recipient: 'Grade 10', channel: 'Bulk SMS', time: '1h ago' },
               ].map((log, i) => (
                 <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                       <div>
                          <p className="text-sm font-bold text-text-primary uppercase tracking-tighter">{log.event}</p>
                          <p className="text-[10px] text-text-muted font-bold uppercase">{log.recipient} • {log.channel}</p>
                       </div>
                    </div>
                    <span className="text-[10px] font-medium text-text-muted">{log.time}</span>
                 </div>
               ))}
            </div>
            <button className="w-full py-4 bg-surface-background/50 text-xs font-bold text-primary hover:bg-surface-background transition-colors border-t border-surface-border">
               View Full Audit Logs
            </button>
         </div>
      </div>
    </div>
  );
}
