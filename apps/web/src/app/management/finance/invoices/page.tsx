import React from 'react';
import { Search, Filter, MoreVertical, FileText, Download, Mail, ExternalLink, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function InvoicesPage() {
  const invoices = [
    { id: 'INV-2026-00124', student: 'Alice Johnson', class: 'Grade 10-A', date: 'Aug 24, 2026', due: 'Sep 05, 2026', amount: '₹12,500', balance: '₹0', status: 'PAID' },
    { id: 'INV-2026-00125', student: 'Michael Chen', class: 'Grade 10-B', date: 'Aug 25, 2026', due: 'Sep 05, 2026', amount: '₹12,500', balance: '₹4,500', status: 'PARTIALLY_PAID' },
    { id: 'INV-2026-00126', student: 'Sarah Williams', class: 'Grade 9-A', date: 'Aug 26, 2026', due: 'Sep 05, 2026', amount: '₹10,200', balance: '₹10,200', status: 'ISSUED' },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-600 border-green-200';
      case 'PARTIALLY_PAID': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'ISSUED': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'OVERDUE': return 'bg-red-100 text-red-600 border-red-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Fee Demands</h1>
          <p className="text-text-secondary text-sm">Issue and track student payment requests</p>
        </div>
        <div className="flex gap-2">
           <button className="bg-white border border-surface-border text-text-primary px-4 py-2.5 rounded-button font-bold text-sm hover:bg-surface-background transition-all">
             Bulk Generate
           </button>
           <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
             <FileText className="w-4 h-4" />
             New Invoice
           </button>
        </div>
      </div>

      <div className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
        <div className="p-4 border-b border-surface-border flex items-center justify-between gap-4">
          <div className="flex-1 max-w-sm relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by invoice # or student..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-2 border border-surface-border rounded-lg text-sm font-medium bg-white text-text-secondary outline-none">
              <option>All Statuses</option>
              <option>Paid</option>
              <option>Partial</option>
              <option>Overdue</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-background text-text-muted text-[10px] font-bold uppercase tracking-widest border-b border-surface-border">
              <tr>
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">Balance</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-sm">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4 font-bold text-text-primary">
                    <div className="flex items-center gap-2">
                       <FileText className="w-4 h-4 text-text-muted" />
                       {inv.id}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-text-primary">{inv.student}</p>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{inv.class}</p>
                  </td>
                  <td className="px-6 py-4 text-text-secondary">
                    {inv.due}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-text-primary">
                    {inv.amount}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-red-500">
                    {inv.balance}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${getStatusStyle(inv.status)}`}>
                      {inv.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                       <button className="p-2 hover:bg-primary-light rounded-lg text-primary" title="Download">
                         <Download className="w-4 h-4" />
                       </button>
                       <button className="p-2 hover:bg-primary-light rounded-lg text-primary" title="Email">
                         <Mail className="w-4 h-4" />
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
