'use client';
import React from 'react';
import { AlertTriangle, Award, CheckCircle2, ClipboardList, HeartPulse, ShieldCheck } from 'lucide-react';

const cards = [
  ['Open Cases','12','Require review or follow-up',AlertTriangle],
  ['Actions Due','7','Assigned interventions',ClipboardList],
  ['Positive Points','486','Recognition points this term',Award],
  ['Counseling Follow-ups','9','Students needing support',HeartPulse],
] as const;

export default function StudentLifeDashboard() {
  return <div className="space-y-8 animate-in fade-in duration-500">
    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
      <div><div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-primary mb-2"><ShieldCheck className="w-4 h-4"/> Student Success & Safeguarding</div><h1 className="text-3xl font-black text-text-primary">Behavior & Student Life</h1><p className="text-text-secondary mt-1 max-w-2xl">Manage discipline, positive recognition, interventions and student wellbeing from one accountable workflow.</p></div>
      <button className="bg-primary text-white px-5 py-3 rounded-button font-bold shadow-md">Report Behavior Incident</button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">{cards.map(([label,value,hint,Icon])=><div key={label} className="bg-white border border-surface-border rounded-card p-6 shadow-card"><div className="flex justify-between"><div className="p-3 rounded-xl bg-primary/10 text-primary"><Icon className="w-6 h-6"/></div><CheckCircle2 className="w-4 h-4 text-green-600"/></div><p className="text-sm font-bold text-text-muted mt-5">{label}</p><p className="text-3xl font-black text-text-primary mt-1">{value}</p><p className="text-xs text-text-secondary mt-2">{hint}</p></div>)}</div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
      <div className="lg:col-span-2 bg-white border border-surface-border rounded-card shadow-card p-7"><h2 className="text-lg font-black text-text-primary">Case Management</h2><p className="text-xs text-text-muted mt-1">A complete lifecycle from report to resolution</p><div className="mt-6 grid md:grid-cols-2 gap-4">{[['Incident Register','Record behavioral concerns, bullying, attendance-linked behavior and safeguarding observations.'],['Intervention Plans','Assign restorative actions, meetings, warnings, parent conferences and follow-ups.'],['Positive Recognition','Award points for leadership, attendance, academics, sports and community contribution.'],['Counseling','Maintain confidential counseling sessions, action plans and scheduled follow-ups.']].map(([t,d])=><div key={t} className="border border-surface-border rounded-xl p-5"><h3 className="font-bold text-sm text-text-primary">{t}</h3><p className="text-xs text-text-secondary leading-5 mt-2">{d}</p></div>)}</div></div>
      <div className="bg-white border border-surface-border rounded-card shadow-card p-7"><h2 className="text-lg font-black text-text-primary">Governance</h2><div className="space-y-4 mt-6">{['School and organization isolation','Every case has an accountable reporter','Audit trail for status and points','Role-based access to wellbeing data','Parent communication through notification engine'].map(x=><div key={x} className="flex gap-3 text-sm font-semibold text-text-primary"><ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5"/>{x}</div>)}</div></div>
    </div>
  </div>;
}
