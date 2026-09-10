import React from 'react';
import { Search, Filter, Plus, MoreVertical, FileText, CheckCircle2, Clock, RotateCcw, ChevronRight } from 'lucide-react';

export default function JournalEntriesPage() {
  const entries = [
    { id: 'JE-2026-000452', date: 'Aug 28, 2026', desc: 'Fee payment received - Alice Johnson', journal: 'Receipts', amount: '₹12,500', status: 'POSTED' },
    { id: 'JE-2026-000453', date: 'Aug 28, 2026', desc: 'Monthly electricity bill payment', journal: 'Cash', amount: '₹4,200', status: 'POSTED' },
    { id: 'JE-2026-000454', date: 'Aug 29, 2026', desc: 'Stationery supplies purchase', journal: 'General', amount: '₹1,500', status: 'DRAFT' },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'POSTED': return 'bg-green-100 text-green-600 border-green-200';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'REVERSED': return 'bg-red-100 text-red-600 border-red-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Journal Entries</h1>
          <p className="text-text-secondary text-sm">Review and manage all financial transactions</p>
        </div>
        <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md flex items-center gap-2 hover:bg-primary-dark transition-all">
          <Plus className="w-4 h-4" />
          New Entry
        </button>
      </div>

      <div className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
        <div className="p-4 border-b border-surface-border flex items-center justify-between gap-4">
          <div className="flex-1 max-w-sm relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by entry # or description..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-2 border border-surface-border rounded-lg text-sm font-medium bg-white text-text-secondary outline-none">
              <option>All Journals</option>
              <option>Receipts</option>
              <option>Cash</option>
              <option>Bank</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 border border-surface-border rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-background transition-colors">
              <Filter className="w-4 h-4" />
              <span>Advanced</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-background text-text-muted text-[10px] font-bold uppercase tracking-widest border-b border-surface-border">
              <tr>
                <th className="px-6 py-4">Entry #</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Journal</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-sm">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4 font-bold text-text-primary">
                    <code className="text-xs">{entry.id}</code>
                  </td>
                  <td className="px-6 py-4 text-text-secondary">
                    {entry.date}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-text-primary truncate max-w-xs">{entry.desc}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary-light px-2 py-0.5 rounded">
                      {entry.journal}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-text-primary">
                    {entry.amount}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${getStatusStyle(entry.status)}`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                       <button className="p-2 hover:bg-primary-light rounded-lg text-primary" title="View Detail">
                         <ChevronRight className="w-4 h-4" />
                       </button>
                       <button className="p-2 hover:bg-primary-light rounded-lg text-primary" title="Reverse">
                         <RotateCcw className="w-4 h-4" />
                       </button>
                       <button className="p-2 hover:bg-surface-background rounded-full text-text-muted">
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
