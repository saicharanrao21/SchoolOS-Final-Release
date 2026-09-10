'use client';

import { useState } from 'react';
import { BellRing, Clock3, Percent, RefreshCcw, ShieldCheck, WalletCards } from 'lucide-react';

const buckets = [
  ['Current', '₹0', 'Not yet overdue'],
  ['1–30 days', '₹0', 'Early follow-up'],
  ['31–60 days', '₹0', 'Priority collection'],
  ['61–90 days', '₹0', 'Escalation'],
  ['90+ days', '₹0', 'Critical ageing'],
];

export default function FeeCollectionControl() {
  const [channel, setChannel] = useState('WHATSAPP');
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Finance Operations</p>
        <h1 className="text-3xl font-bold text-text-primary mt-2">Fee Collection Control</h1>
        <p className="text-text-secondary mt-2 max-w-3xl">Manage overdue policies, ageing, and automated payment reminders from one school-scoped control surface.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          [Clock3, 'Overdue Engine', 'Apply late fees using the school policy'],
          [BellRing, 'Reminder Queue', 'Queue SMS, WhatsApp, email or push'],
          [WalletCards, 'Collection Ageing', 'See outstanding balances by ageing'],
        ].map(([Icon, title, text]) => (
          <div key={String(title)} className="bg-white rounded-card border border-surface-border shadow-card p-6">
            <Icon className="w-6 h-6 text-primary mb-4" />
            <h3 className="font-bold text-text-primary">{String(title)}</h3>
            <p className="text-sm text-text-secondary mt-1">{String(text)}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-card border border-surface-border shadow-card p-6">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Receivables Ageing</h2>
            <p className="text-sm text-text-secondary">Live school-scoped outstanding balance buckets.</p>
          </div>
          <button className="inline-flex items-center gap-2 border border-surface-border rounded-button px-4 py-2 text-sm font-bold">
            <RefreshCcw className="w-4 h-4" /> Refresh
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {buckets.map(([label, amount, hint]) => (
            <div key={label} className="rounded-2xl border border-surface-border p-4 bg-surface-background">
              <p className="text-xs font-bold text-text-muted uppercase">{label}</p>
              <p className="text-2xl font-bold text-text-primary mt-2">{amount}</p>
              <p className="text-xs text-text-secondary mt-1">{hint}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-card border border-surface-border shadow-card p-6">
          <div className="flex items-center gap-3 mb-5"><Percent className="w-5 h-5 text-primary" /><h2 className="text-lg font-bold">Late Fee Policy</h2></div>
          <div className="grid grid-cols-2 gap-4">
            <label className="text-sm font-semibold">Policy name<input className="mt-2 w-full border rounded-lg px-3 py-2" placeholder="Monthly late fee" /></label>
            <label className="text-sm font-semibold">Type<select className="mt-2 w-full border rounded-lg px-3 py-2"><option>PERCENTAGE</option><option>FIXED</option><option>DAILY_FIXED</option></select></label>
            <label className="text-sm font-semibold">Value<input type="number" className="mt-2 w-full border rounded-lg px-3 py-2" placeholder="2" /></label>
            <label className="text-sm font-semibold">Grace days<input type="number" className="mt-2 w-full border rounded-lg px-3 py-2" placeholder="5" /></label>
          </div>
          <button className="mt-5 bg-primary text-white rounded-button px-5 py-2.5 font-bold text-sm">Save Policy</button>
        </div>

        <div className="bg-white rounded-card border border-surface-border shadow-card p-6">
          <div className="flex items-center gap-3 mb-5"><BellRing className="w-5 h-5 text-primary" /><h2 className="text-lg font-bold">Queue Fee Reminders</h2></div>
          <label className="text-sm font-semibold block">Channel<select value={channel} onChange={e => setChannel(e.target.value)} className="mt-2 w-full border rounded-lg px-3 py-2"><option>WHATSAPP</option><option>SMS</option><option>EMAIL</option><option>PUSH</option></select></label>
          <label className="text-sm font-semibold block mt-4">Due within days<input type="number" defaultValue={3} min={0} max={30} className="mt-2 w-full border rounded-lg px-3 py-2" /></label>
          <div className="flex items-center gap-2 mt-5 text-xs text-text-secondary"><ShieldCheck className="w-4 h-4" /> Recipients are resolved from the student's authorized guardian records.</div>
          <button className="mt-5 bg-primary text-white rounded-button px-5 py-2.5 font-bold text-sm">Queue {channel} Reminders</button>
        </div>
      </div>
    </div>
  );
}
