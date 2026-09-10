'use client';
import React, { useMemo, useState } from 'react';
import { Landmark, RefreshCcw, Upload, CheckCircle2, AlertTriangle, Search } from 'lucide-react';

const demo = [
  { id: 'BTX-1001', date: '09 Sep 2026', reference: 'RZP-824901', description: 'Online fee collection', credit: 24500, status: 'MATCHED' },
  { id: 'BTX-1002', date: '09 Sep 2026', reference: 'NEFT-22014', description: 'Fee collection', credit: 18000, status: 'UNMATCHED' },
  { id: 'BTX-1003', date: '08 Sep 2026', reference: 'UPI-78120', description: 'Parent payment', credit: 12500, status: 'PARTIALLY_MATCHED' },
  { id: 'BTX-1004', date: '08 Sep 2026', reference: 'CHG-001', description: 'Bank charges', credit: 0, debit: 850, status: 'EXCLUDED' },
];

export default function BankReconciliationPage() {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => demo.filter(x => `${x.reference} ${x.description}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const unresolved = demo.filter(x => x.status === 'UNMATCHED' || x.status === 'PARTIALLY_MATCHED').length;
  return <div className="space-y-8 animate-in fade-in duration-500">
    <div className="flex items-center justify-between">
      <div><h1 className="text-2xl font-bold text-text-primary">Bank Reconciliation</h1><p className="text-sm text-text-secondary">Match bank statement movements against recorded school payments and ledger activity.</p></div>
      <div className="flex gap-3"><button className="px-4 py-2.5 rounded-button border border-surface-border bg-white font-bold text-sm flex items-center gap-2"><Upload className="w-4 h-4"/> Import Statement</button><button className="px-4 py-2.5 rounded-button bg-primary text-white font-bold text-sm flex items-center gap-2"><RefreshCcw className="w-4 h-4"/> Auto Match</button></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
      {([['Statements','12',Landmark],['Matched','38',CheckCircle2],['Unresolved',String(unresolved),AlertTriangle],['Reconciled Value','₹12.8L',Landmark]] as Array<[string, string, any]>).map(([label,value,Icon])=><div key={String(label)} className="bg-white p-5 rounded-card border border-surface-border shadow-card"><div className="flex justify-between"><span className="text-sm text-text-muted">{label}</span>{React.createElement(Icon,{className:'w-5 h-5 text-primary'})}</div><p className="text-2xl font-bold mt-2 text-text-primary">{value}</p></div>)}
    </div>
    <div className="bg-white rounded-card border border-surface-border shadow-card overflow-hidden">
      <div className="p-5 border-b border-surface-border flex items-center justify-between"><h2 className="font-bold text-lg">Statement Transactions</h2><div className="relative"><Search className="absolute left-3 top-2.5 w-4 h-4 text-text-muted"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search reference or description" className="pl-9 pr-4 py-2 border border-surface-border rounded-lg text-sm outline-none"/></div></div>
      <div className="divide-y divide-surface-border">{filtered.map(t=><div key={t.id} className="p-5 flex items-center justify-between gap-4 hover:bg-surface-background"><div><p className="font-bold text-text-primary">{t.description}</p><p className="text-xs text-text-muted mt-1">{t.date} · {t.reference}</p></div><div className="text-right"><p className="font-bold">{t.credit ? `₹${t.credit.toLocaleString('en-IN')}` : `-₹${(t.debit||0).toLocaleString('en-IN')}`}</p><span className={`text-[10px] font-bold px-2 py-1 rounded-full ${t.status==='MATCHED'?'bg-green-50 text-green-700':t.status==='EXCLUDED'?'bg-slate-100 text-slate-600':'bg-orange-50 text-orange-700'}`}>{t.status.replace('_',' ')}</span></div></div>)}</div>
      <div className="p-4 border-t border-surface-border text-xs text-text-muted">{unresolved} transactions require review before statement closure.</div>
    </div>
  </div>;
}
