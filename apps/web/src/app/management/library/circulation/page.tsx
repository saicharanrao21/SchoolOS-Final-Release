'use client';

import { useMemo, useState } from 'react';
import { BookOpen, CalendarClock, CheckCircle2, IndianRupee, Search, ShieldCheck } from 'lucide-react';

const sample = [
  { title: 'Advanced Mathematics', member: 'Student Member', card: 'LIB-00124', due: 'Today', status: 'DUE', fine: '₹0' },
  { title: 'Physics Fundamentals', member: 'Student Member', card: 'LIB-00108', due: '2 days overdue', status: 'OVERDUE', fine: '₹20' },
  { title: 'The Discovery of India', member: 'Faculty Member', card: 'LIB-00031', due: '5 days', status: 'ISSUED', fine: '₹0' },
];

export default function LibraryCirculationPage() {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => sample.filter((x) => `${x.title} ${x.member} ${x.card}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const cards = [
    ['Active Issues', '342', BookOpen],
    ['Due Today', '24', CalendarClock],
    ['Overdue', '18', ShieldCheck],
    ['Outstanding Fines', '₹12,480', IndianRupee],
  ];
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Library Operations</p>
        <h1 className="mt-2 text-3xl font-bold text-text-primary">Circulation Control</h1>
        <p className="mt-1 text-sm text-text-secondary">Issue, renew, return and reconcile library activity from one workspace.</p>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value, Icon]) => (
          <div key={label as string} className="rounded-card border border-surface-border bg-white p-5 shadow-card">
            <Icon className="h-5 w-5 text-primary" />
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-text-muted">{label as string}</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">{value as string}</p>
          </div>
        ))}
      </div>
      <div className="rounded-card border border-surface-border bg-white shadow-card">
        <div className="flex flex-col gap-4 border-b border-surface-border p-6 md:flex-row md:items-center md:justify-between">
          <div><h2 className="font-bold text-text-primary">Active circulation</h2><p className="text-xs text-text-muted">Live operational queue</p></div>
          <div className="relative w-full md:w-80"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title, member or card" className="w-full rounded-xl border border-surface-border bg-surface-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary" /></div>
        </div>
        <div className="divide-y divide-surface-border">
          {filtered.map((item) => (
            <div key={item.card + item.title} className="grid gap-3 p-5 md:grid-cols-[2fr_1.3fr_1fr_auto] md:items-center">
              <div><p className="font-bold text-text-primary">{item.title}</p><p className="text-xs text-text-muted">{item.card}</p></div>
              <div><p className="text-sm text-text-primary">{item.member}</p><p className="text-xs text-text-muted">Member</p></div>
              <div><p className="text-sm font-semibold text-text-primary">{item.due}</p><p className="text-xs text-text-muted">Due status</p></div>
              <div className="text-right"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${item.status === 'OVERDUE' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{item.status}</span><p className="mt-2 text-xs font-bold text-text-muted">{item.fine}</p></div>
            </div>
          ))}
          {!filtered.length && <div className="p-10 text-center text-sm text-text-muted">No circulation records match your search.</div>}
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-surface-border bg-surface-background p-4 text-xs text-text-secondary"><CheckCircle2 className="h-4 w-4 text-primary" /> All circulation actions are expected to be validated against the authenticated organization and school on the API.</div>
    </div>
  );
}
