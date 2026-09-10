'use client';
import React, { useState } from 'react';
import { ClipboardList, Plus, Send, CheckCircle2, XCircle } from 'lucide-react';

const stages = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CONVERTED'];
export default function PurchaseRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [schoolId, setSchoolId] = useState('');
  const [busy, setBusy] = useState(false);

  async function createRequest() {
    if (!schoolId || !description.trim()) return;
    setBusy(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
      const res = await fetch(`${base}/procurement/requests`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ schoolId, description, priority }) });
      if (!res.ok) throw new Error('Unable to create request');
      const data = await res.json();
      setRequests((r) => [data, ...r]);
      setDescription('');
    } finally { setBusy(false); }
  }

  return <div className="space-y-8 animate-in fade-in duration-500">
    <header><h1 className="text-2xl font-bold text-text-primary">Purchase Requests</h1><p className="text-sm text-text-secondary">Control requisitions from request through approval and sourcing.</p></header>
    <section className="bg-white rounded-card border border-surface-border shadow-card p-6 grid md:grid-cols-4 gap-4">
      <input className="border rounded-xl px-3 py-2" placeholder="School ID" value={schoolId} onChange={e=>setSchoolId(e.target.value)} />
      <input className="border rounded-xl px-3 py-2 md:col-span-2" placeholder="What needs to be purchased?" value={description} onChange={e=>setDescription(e.target.value)} />
      <div className="flex gap-2"><select className="border rounded-xl px-3 py-2 flex-1" value={priority} onChange={e=>setPriority(e.target.value)}><option>NORMAL</option><option>HIGH</option><option>URGENT</option><option>LOW</option></select><button disabled={busy} onClick={createRequest} className="bg-primary text-white rounded-xl px-4 font-bold flex items-center gap-2"><Plus className="w-4 h-4"/>Create</button></div>
    </section>
    <section className="bg-white rounded-card border border-surface-border shadow-card p-6">
      <div className="flex items-center gap-2 mb-6"><ClipboardList className="w-5 h-5 text-primary"/><h2 className="font-bold">Workflow</h2></div>
      <div className="grid md:grid-cols-6 gap-3">{stages.map((s,i)=><div key={s} className="rounded-xl border border-surface-border p-4"><p className="text-[10px] font-bold tracking-widest text-text-muted">STEP {i+1}</p><p className="font-bold mt-1">{s.replace('_',' ')}</p></div>)}</div>
      <div className="mt-6 divide-y divide-surface-border">{requests.map(r=><div key={r.id} className="py-4 flex items-center justify-between"><div><p className="font-bold text-primary">{r.requestNumber}</p><p className="text-sm text-text-secondary">{r.description}</p></div><span className="text-xs font-bold px-3 py-1 rounded-full bg-surface-background">{r.status}</span></div>)}</div>
    </section>
  </div>;
}
