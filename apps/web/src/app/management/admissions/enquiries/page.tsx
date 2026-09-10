import React from 'react';
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

export default function EnquiriesPage() {
  const enquiries = [
    { id: '1', name: 'James Wilson', phone: '+1 234 567 8901', class: 'Grade 5', source: 'Website', date: 'Aug 24, 2026', status: 'NEW' },
    { id: '2', name: 'Sophia Martinez', phone: '+1 987 654 3210', class: 'Grade 8', source: 'Walk-in', date: 'Aug 22, 2026', status: 'FOLLOW_UP' },
    { id: '3', name: 'William Brown', phone: '+1 555 012 3456', class: 'Grade 2', source: 'Referral', date: 'Aug 20, 2026', status: 'INTERESTED' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Leads & Enquiries</h1>
          <p className="text-text-secondary">Capture and nurture prospective student interest</p>
        </div>
        <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Enquiry
        </button>
      </div>

      <div className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
        <div className="p-4 border-b border-surface-border flex items-center justify-between gap-4">
          <div className="flex-1 max-w-sm relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search enquiries..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-surface-border rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-background transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-background text-text-muted text-[10px] font-bold uppercase tracking-widest border-b border-surface-border">
              <tr>
                <th className="px-6 py-4">Prospect</th>
                <th className="px-6 py-4">Interested Class</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-sm">
              {enquiries.map((enq) => (
                <tr key={enq.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-text-primary">{enq.name}</p>
                      <p className="text-xs text-text-muted mt-0.5">{enq.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-text-secondary">{enq.class}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-tight bg-surface-background px-2 py-1 rounded border border-surface-border">
                      {enq.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-muted">
                    {enq.date}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-[10px] font-bold rounded-full ${
                      enq.status === 'NEW' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {enq.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button className="p-2 hover:bg-primary/10 rounded-lg text-primary opacity-0 group-hover:opacity-100 transition-all">
                        <Phone className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-primary/10 rounded-lg text-primary opacity-0 group-hover:opacity-100 transition-all">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-surface-background rounded-full text-text-muted transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
