'use client';

import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, Search, ShieldCheck, XOctagon, History } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
const authHeaders = () => ({ Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : ''}` });

export default function PlatformAuditPage() {
  const [summary, setSummary] = useState<any>({ total: 0, today: 0, high: 0, critical: 0 });
  const [data, setData] = useState<any>({ items: [], total: 0 });
  const [action, setAction] = useState('');
  const [severity, setSeverity] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: '1', pageSize: '50' });
      if (action.trim()) params.set('action', action.trim());
      if (severity) params.set('severity', severity);
      const [summaryResponse, eventsResponse] = await Promise.all([
        fetch(`${API_URL}/platform/audit/summary`, { headers: authHeaders() }),
        fetch(`${API_URL}/platform/audit?${params.toString()}`, { headers: authHeaders() }),
      ]);
      if (summaryResponse.ok) setSummary(await summaryResponse.json());
      if (eventsResponse.ok) setData(await eventsResponse.json());
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  const cards = [
    ['Total Events', summary.total, Activity],
    ['Today', summary.today, History],
    ['High Severity', summary.high, AlertTriangle],
    ['Critical', summary.critical, XOctagon],
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-3 text-primary"><ShieldCheck className="h-6 w-6" /></div>
        <div><h1 className="text-2xl font-bold text-text-primary">Platform Audit Center</h1><p className="text-sm text-text-secondary">Searchable security, administration and operational audit history.</p></div>
      </header>
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map(([label, value, Icon]: any) => <div key={label} className="rounded-card border border-surface-border bg-white p-5 shadow-card"><Icon className="mb-3 h-5 w-5 text-primary" /><p className="text-xs font-bold uppercase tracking-wide text-text-muted">{label}</p><p className="mt-1 text-2xl font-bold text-text-primary">{value}</p></div>)}
      </div>
      <section className="rounded-card border border-surface-border bg-white p-5 shadow-card">
        <div className="flex flex-wrap gap-3">
          <div className="flex min-w-64 flex-1 items-center gap-2 rounded-lg border px-3"><Search className="h-4 w-4 text-text-muted" /><input value={action} onChange={e => setAction(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} className="w-full p-2 text-sm outline-none" placeholder="Search action…" /></div>
          <select value={severity} onChange={e => { setSeverity(e.target.value); }} className="rounded-lg border px-3 py-2 text-sm"><option value="">All severities</option><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></select>
          <button onClick={() => void load()} className="rounded-button bg-primary px-5 py-2 text-sm font-bold text-white">Search</button>
        </div>
      </section>
      <section className="overflow-hidden rounded-card border border-surface-border bg-white shadow-card">
        <div className="border-b p-5"><h2 className="font-bold">Audit Events <span className="text-xs font-normal text-text-muted">({data.total || 0})</span></h2></div>
        {loading ? <p className="p-6 text-sm text-text-muted">Loading audit history…</p> : data.items?.length ? <div className="divide-y">{data.items.map((event: any) => <article key={event.id} className="grid gap-3 p-5 md:grid-cols-[150px_1fr_190px_180px]"><div><span className="rounded-full bg-surface-background px-2 py-1 text-[10px] font-bold">{event.severity}</span><p className="mt-2 text-[11px] text-text-muted">{new Date(event.createdAt).toLocaleString()}</p></div><div><p className="font-semibold text-text-primary">{event.action}</p><p className="text-xs text-text-muted">{event.resource}{event.resourceId ? ` · ${event.resourceId}` : ''}</p></div><div className="text-xs text-text-secondary">{event.actor ? `${event.actor.firstName || ''} ${event.actor.lastName || ''}`.trim() || event.actor.email : 'System'}<br />{event.actor?.email || ''}</div><div className="text-xs text-text-secondary">{event.school?.name || 'Organization scope'}<br />Correlation: {event.correlationId || '—'}</div></article>)}</div> : <p className="p-6 text-sm text-text-muted">No audit events match the current filters.</p>}
      </section>
    </div>
  );
}
