'use client';

import { useState } from 'react';
import { PageHeader } from '../../../../components/common/PageHeader';
import { Card } from '../../../../components/common/Card';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { BellRing, Clock3, Percent, RefreshCcw, ShieldCheck, WalletCards } from 'lucide-react';

const buckets = [
  { label: 'Current', amount: '$45,200', hint: 'Not yet overdue' },
  { label: '1–30 days', amount: '$12,800', hint: 'Early follow-up' },
  { label: '31–60 days', amount: '$8,400', hint: 'Priority collection' },
  { label: '61–90 days', amount: '$3,200', hint: 'Escalation' },
  { label: '90+ days', amount: '$1,100', hint: 'Critical ageing' },
];

export default function FeeCollectionControlPage() {
  const [channel, setChannel] = useState('WHATSAPP');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Fee Collection Control & Receivables Ledger"
        subtitle="Manage overdue fee late policies, receivables ageing buckets, and automated payment reminder queues"
        badge="Idempotent Payment Engine"
        badgeVariant="SUCCESS"
        breadcrumbs={[
          { label: 'SchoolOS', href: '/management/dashboard' },
          { label: 'Fees & Finance' },
          { label: 'Collection Control' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Clock3, title: 'Late Fee Overdue Engine', desc: 'Apply late fees using school policy rules' },
          { icon: BellRing, title: 'Multi-Channel Reminders', desc: 'Queue SMS, WhatsApp, email, or push' },
          { icon: WalletCards, title: 'Receivables Ageing', desc: 'Monitor outstanding balances by ageing' },
        ].map((item) => (
          <Card key={item.title}>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 text-primary shrink-0">
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-text-primary">{item.title}</h3>
                <p className="text-[11px] text-text-secondary mt-0.5">{item.desc}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card
        title="Receivables Ageing Buckets"
        action={
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-surface-border bg-white rounded-lg text-xs font-bold text-text-primary hover:bg-surface-hover shadow-2xs">
            <RefreshCcw className="w-3.5 h-3.5" /> Refresh Ageing
          </button>
        }
      >
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {buckets.map((b) => (
            <div key={b.label} className="rounded-xl border border-surface-border p-4 bg-surface-background text-center">
              <p className="text-[10px] font-bold text-text-muted uppercase">{b.label}</p>
              <p className="text-xl font-bold text-text-primary mt-1">{b.amount}</p>
              <p className="text-[10px] text-text-secondary mt-0.5">{b.hint}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Late Fee Policy Configuration">
          <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
            <label className="space-y-1">
              <span>Policy Name</span>
              <input className="w-full border border-surface-border rounded-xl px-3 py-2 bg-white" defaultValue="Standard Late Fee" />
            </label>
            <label className="space-y-1">
              <span>Policy Type</span>
              <select className="w-full border border-surface-border rounded-xl px-3 py-2 bg-white">
                <option value="PERCENTAGE">PERCENTAGE</option>
                <option value="FIXED">FIXED</option>
                <option value="DAILY_FIXED">DAILY_FIXED</option>
              </select>
            </label>
            <label className="space-y-1">
              <span>Value</span>
              <input type="number" className="w-full border border-surface-border rounded-xl px-3 py-2 bg-white" defaultValue={2} />
            </label>
            <label className="space-y-1">
              <span>Grace Days</span>
              <input type="number" className="w-full border border-surface-border rounded-xl px-3 py-2 bg-white" defaultValue={5} />
            </label>
          </div>
          <button className="mt-4 bg-primary hover:bg-primary-hover text-white rounded-xl px-4 py-2 font-bold text-xs shadow-sm">
            Save Late Fee Policy
          </button>
        </Card>

        <Card title="Queue Payment Reminders">
          <div className="space-y-3 text-xs font-semibold">
            <label className="space-y-1 block">
              <span>Channel</span>
              <select value={channel} onChange={(e) => setChannel(e.target.value)} className="w-full border border-surface-border rounded-xl px-3 py-2 bg-white">
                <option value="WHATSAPP">WHATSAPP</option>
                <option value="SMS">SMS</option>
                <option value="EMAIL">EMAIL</option>
                <option value="PUSH">PUSH</option>
              </select>
            </label>
            <label className="space-y-1 block">
              <span>Due within days</span>
              <input type="number" defaultValue={3} min={0} max={30} className="w-full border border-surface-border rounded-xl px-3 py-2 bg-white" />
            </label>
            <p className="flex items-center gap-1.5 text-[11px] text-text-muted pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Recipients resolved from authorized parent guardian records.
            </p>
          </div>
          <button className="mt-4 bg-primary hover:bg-primary-hover text-white rounded-xl px-4 py-2 font-bold text-xs shadow-sm">
            Queue {channel} Reminders
          </button>
        </Card>
      </div>
    </div>
  );
}
