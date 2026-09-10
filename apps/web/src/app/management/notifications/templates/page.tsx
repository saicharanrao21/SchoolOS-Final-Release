import React from 'react';
import {
  FileText,
  Search,
  Filter,
  Plus,
  MoreVertical,
  ChevronRight,
  MessageSquare,
  Mail,
  Smartphone,
  SmartphoneNfc
} from 'lucide-react';

export default function NotificationTemplatesPage() {
  const templates = [
    { id: '1', name: 'Student Absence Alert', event: 'student.absent', channel: 'WHATSAPP', language: 'en', version: 2, status: 'ACTIVE' },
    { id: '2', name: 'Fee Due Reminder', event: 'fee.due', channel: 'SMS', language: 'en', version: 1, status: 'ACTIVE' },
    { id: '3', name: 'Result Published Notification', event: 'result.published', channel: 'PUSH', language: 'en', version: 3, status: 'ACTIVE' },
    { id: '4', name: 'Welcome Email', event: 'user.created', channel: 'EMAIL', language: 'en', version: 1, status: 'DRAFT' },
  ];

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'WHATSAPP': return MessageSquare;
      case 'EMAIL': return Mail;
      case 'SMS': return SmartphoneNfc;
      case 'PUSH': return Smartphone;
      default: return FileText;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Communication Templates</h1>
          <p className="text-text-secondary text-sm">Define and version multi-channel notification content</p>
        </div>
        <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Template
        </button>
      </div>

      <div className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
        <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-background/20">
          <div className="flex-1 max-w-sm relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by name or event..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-border focus:ring-2 focus:ring-primary/20 outline-none text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-2 border border-surface-border rounded-lg text-sm font-medium bg-white text-text-secondary outline-none">
              <option>All Channels</option>
              <option>WhatsApp</option>
              <option>Email</option>
              <option>SMS</option>
              <option>Push</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-background text-text-muted text-[10px] font-bold uppercase tracking-widest border-b border-surface-border">
              <tr>
                <th className="px-8 py-4">Template Name</th>
                <th className="px-8 py-4">Event Trigger</th>
                <th className="px-8 py-4 text-center">Channel</th>
                <th className="px-8 py-4 text-center">Version</th>
                <th className="px-8 py-4 text-center">Status</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {templates.map((t) => {
                const Icon = getChannelIcon(t.channel);
                return (
                  <tr key={t.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-8 py-5">
                       <span className="font-bold text-text-primary">{t.name}</span>
                    </td>
                    <td className="px-8 py-5">
                       <code className="text-xs font-bold text-primary bg-primary-light px-2 py-0.5 rounded uppercase tracking-tighter">
                         {t.event}
                       </code>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center justify-center gap-2">
                          <Icon className="w-4 h-4 text-text-muted" />
                          <span className="text-[10px] font-bold text-text-muted uppercase">{t.channel}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                       <span className="px-2 py-1 bg-surface-background border rounded text-[10px] font-bold text-text-primary">v{t.version}.0</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                         t.status === 'ACTIVE' ? 'bg-green-100 text-green-600 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                       }`}>
                         {t.status}
                       </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button className="p-2 hover:bg-primary-light rounded-lg text-primary">
                             <ChevronRight className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-surface-background rounded-full text-text-muted">
                             <MoreVertical className="w-4 h-4" />
                          </button>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
