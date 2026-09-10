'use client';

import { useMemo, useState } from 'react';
import { Award, BadgeCheck, CalendarClock, FileCheck2, GraduationCap, Search, ShieldAlert, Star, Users } from 'lucide-react';

const documents = [
  { employee: 'Ananya Rao', id: 'EMP-000041', type: 'Government ID', expiry: '12 Sep 2026', verified: true },
  { employee: 'Rahul Kumar', id: 'EMP-000052', type: 'Teaching License', expiry: '28 Sep 2026', verified: false },
  { employee: 'Meera Shah', id: 'EMP-000067', type: 'First Aid Certificate', expiry: '14 Oct 2026', verified: true },
];

const reviews = [
  { employee: 'Ananya Rao', period: '2025-26', rating: 4.6, status: 'COMPLETED', reviewer: 'Academic Head' },
  { employee: 'Rahul Kumar', period: '2025-26', rating: 3.9, status: 'SUBMITTED', reviewer: 'Principal' },
  { employee: 'Meera Shah', period: '2026-27', rating: 4.3, status: 'DRAFT', reviewer: 'Academic Head' },
];

const training = [
  { title: 'NEP 2020 Classroom Practice', employee: 'Ananya Rao', provider: 'SCERT', status: 'COMPLETED', hours: 12 },
  { title: 'Child Safeguarding Refresher', employee: 'Rahul Kumar', provider: 'SchoolOS Academy', status: 'IN_PROGRESS', hours: 8 },
  { title: 'Inclusive Education Workshop', employee: 'Meera Shah', provider: 'CBSE', status: 'PLANNED', hours: 6 },
];

export default function HrCompliancePage() {
  const [query, setQuery] = useState('');
  const q = query.toLowerCase();
  const filteredDocs = useMemo(() => documents.filter(x => `${x.employee} ${x.id} ${x.type}`.toLowerCase().includes(q)), [q]);
  const filteredReviews = useMemo(() => reviews.filter(x => `${x.employee} ${x.period} ${x.reviewer}`.toLowerCase().includes(q)), [q]);
  const filteredTraining = useMemo(() => training.filter(x => `${x.title} ${x.employee} ${x.provider}`.toLowerCase().includes(q)), [q]);

  const cards = [
    ['Active Staff', '142', Users],
    ['Verified Documents', '128', FileCheck2],
    ['Expiring in 30 Days', '7', ShieldAlert],
    ['Reviews Awaiting Action', '18', Award],
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Human Resources</p>
          <h1 className="mt-2 text-3xl font-bold text-text-primary">Compliance & People Development</h1>
          <p className="mt-1 max-w-3xl text-sm text-text-secondary">Control employee documentation, appraisal cycles, statutory readiness and professional development from one workspace.</p>
        </div>
        <div className="relative w-full md:w-80"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search employees, reviews, training" className="w-full rounded-xl border border-surface-border bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary" /></div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value, Icon]) => <div key={label as string} className="rounded-card border border-surface-border bg-white p-5 shadow-card"><Icon className="h-5 w-5 text-primary" /><p className="mt-4 text-xs font-bold uppercase tracking-wider text-text-muted">{label as string}</p><p className="mt-1 text-2xl font-bold text-text-primary">{value as string}</p></div>)}
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <section className="rounded-card border border-surface-border bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-surface-border p-6"><div><h2 className="font-bold text-text-primary">Compliance documents</h2><p className="text-xs text-text-muted">Verification and expiry control</p></div><FileCheck2 className="h-5 w-5 text-primary" /></div>
          <div className="divide-y divide-surface-border">{filteredDocs.map(d => <div key={d.id + d.type} className="flex items-center justify-between gap-4 p-5"><div><p className="font-bold text-text-primary">{d.employee}</p><p className="text-xs text-text-muted">{d.id} · {d.type}</p></div><div className="text-right"><p className="text-xs font-semibold text-text-primary">Expires {d.expiry}</p><span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${d.verified ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>{d.verified ? <BadgeCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}{d.verified ? 'VERIFIED' : 'VERIFY'}</span></div></div>)}</div>
        </section>

        <section className="rounded-card border border-surface-border bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-surface-border p-6"><div><h2 className="font-bold text-text-primary">Performance reviews</h2><p className="text-xs text-text-muted">Appraisal and acknowledgement cycle</p></div><Star className="h-5 w-5 text-primary" /></div>
          <div className="divide-y divide-surface-border">{filteredReviews.map(r => <div key={r.employee + r.period} className="flex items-center justify-between gap-4 p-5"><div><p className="font-bold text-text-primary">{r.employee}</p><p className="text-xs text-text-muted">{r.period} · {r.reviewer}</p></div><div className="text-right"><p className="flex items-center justify-end gap-1 text-sm font-bold text-text-primary"><Star className="h-3.5 w-3.5" />{r.rating.toFixed(1)}/5</p><span className="text-[10px] font-bold text-text-muted">{r.status}</span></div></div>)}</div>
        </section>

        <section className="rounded-card border border-surface-border bg-white shadow-card xl:col-span-2">
          <div className="flex items-center justify-between border-b border-surface-border p-6"><div><h2 className="font-bold text-text-primary">Professional development</h2><p className="text-xs text-text-muted">Training, certification and learning hours</p></div><GraduationCap className="h-5 w-5 text-primary" /></div>
          <div className="grid divide-y divide-surface-border md:grid-cols-3 md:divide-x md:divide-y-0">{filteredTraining.map(t => <div key={t.title + t.employee} className="p-6"><p className="font-bold text-text-primary">{t.title}</p><p className="mt-1 text-xs text-text-muted">{t.employee} · {t.provider}</p><div className="mt-4 flex items-center justify-between"><span className="rounded-full bg-surface-background px-2.5 py-1 text-[10px] font-bold text-text-secondary">{t.status}</span><span className="flex items-center gap-1 text-xs font-bold text-text-primary"><CalendarClock className="h-3.5 w-3.5" />{t.hours} hrs</span></div></div>)}</div>
        </section>
      </div>
    </div>
  );
}
