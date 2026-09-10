import React from 'react';
import { Plus, Search, Filter, FolderTree, Shield, MoreVertical, ChevronRight, Layers } from 'lucide-react';

export default function ChartOfAccountsPage() {
  const accounts = [
    { code: '1000', name: 'ASSETS', type: 'ASSET', balance: '₹4,825,000', children: 8 },
    { code: '1100', name: 'Cash in Hand', type: 'ASSET', parent: '1000', balance: '₹425,000', children: 0 },
    { code: '1200', name: 'Bank Accounts', type: 'ASSET', parent: '1000', balance: '₹4,400,000', children: 4 },
    { code: '2000', name: 'LIABILITIES', type: 'LIABILITY', balance: '₹1,240,000', children: 3 },
    { code: '3000', name: 'EQUITY', type: 'EQUITY', balance: '₹2,500,000', children: 2 },
    { code: '4000', name: 'REVENUE', type: 'REVENUE', balance: '₹12,400,000', children: 5 },
    { code: '5000', name: 'EXPENSES', type: 'EXPENSE', balance: '₹8,200,000', children: 12 },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ASSET': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'LIABILITY': return 'bg-red-100 text-red-600 border-red-200';
      case 'EQUITY': return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'REVENUE': return 'bg-green-100 text-green-600 border-green-200';
      case 'EXPENSE': return 'bg-orange-100 text-orange-600 border-orange-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Chart of Accounts</h1>
          <p className="text-text-secondary text-sm">Organize and monitor institutional ledger structure</p>
        </div>
        <div className="flex gap-2">
           <button className="bg-white border border-surface-border text-text-primary px-4 py-2.5 rounded-button font-bold text-sm hover:bg-surface-background transition-all">
             Hierarchy View
           </button>
           <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
             <Plus className="w-4 h-4" />
             Add Account
           </button>
        </div>
      </div>

      <div className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
        <div className="p-4 border-b border-surface-border flex items-center justify-between gap-4">
          <div className="flex-1 max-w-sm relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by code or name..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-2 border border-surface-border rounded-lg text-sm font-medium bg-white text-text-secondary outline-none">
              <option>All Types</option>
              <option>Asset</option>
              <option>Liability</option>
              <option>Revenue</option>
              <option>Expense</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-background text-text-muted text-[10px] font-bold uppercase tracking-widest border-b border-surface-border">
              <tr>
                <th className="px-6 py-4">Account Code</th>
                <th className="px-6 py-4">Account Name</th>
                <th className="px-6 py-4 text-center">Type</th>
                <th className="px-6 py-4 text-right">Balance</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-sm">
              {accounts.map((acc) => (
                <tr key={acc.code} className={`hover:bg-blue-50/30 transition-colors group ${!acc.parent ? 'bg-surface-background/20 font-bold' : ''}`}>
                  <td className="px-6 py-4">
                    <code className={`px-2 py-1 rounded text-xs font-bold ${!acc.parent ? 'bg-primary text-white shadow-sm' : 'text-text-secondary bg-surface-background border border-surface-border'}`}>
                      {acc.code}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       {acc.parent && <span className="w-6 h-[1px] bg-surface-border"></span>}
                       <span className="text-text-primary">{acc.name}</span>
                       {acc.children > 0 && <span className="text-[10px] font-bold text-text-muted bg-surface-background px-1.5 rounded border">{acc.children}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${getTypeColor(acc.type)}`}>
                      {acc.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-text-primary">
                    {acc.balance}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                       <button className="p-2 hover:bg-primary-light rounded-lg text-primary opacity-0 group-hover:opacity-100 transition-all">
                         <ChevronRight className="w-4 h-4" />
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
