'use client';

import React from 'react';
import { Activity, AlertTriangle, ClipboardPlus, HeartPulse, Pill, ShieldCheck } from 'lucide-react';

const stats = [
  { label: 'Medical Profiles', value: '—', icon: HeartPulse, hint: 'Centralized student health records' },
  { label: 'Visits Today', value: '—', icon: Activity, hint: 'First-aid and wellness visits' },
  { label: 'Active Medications', value: '—', icon: Pill, hint: 'Medication schedules requiring attention' },
  { label: 'Emergencies Today', value: '—', icon: AlertTriangle, hint: 'Escalate and notify guardians immediately' },
];

export default function StudentHealthDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Student Health & Wellness</h1>
          <p className="text-text-secondary text-sm">Medical profiles, first-aid visits, medications and emergency readiness</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-surface-border text-text-primary px-4 py-2.5 rounded-button font-bold text-sm flex items-center gap-2">
            <ClipboardPlus className="w-4 h-4" /> Record Visit
          </button>
          <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md flex items-center gap-2">
            <HeartPulse className="w-4 h-4" /> Health Centre
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-card shadow-card border border-surface-border">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-primary/10 text-primary"><stat.icon className="w-6 h-6" /></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Live</span>
            </div>
            <p className="text-sm font-medium text-text-muted mt-5">{stat.label}</p>
            <p className="text-3xl font-bold text-text-primary mt-1">{stat.value}</p>
            <p className="text-xs text-text-secondary mt-2">{stat.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-card shadow-card border border-surface-border p-7">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-text-primary">Clinical Operations</h2>
              <p className="text-xs text-text-muted mt-1">Designed for the school nurse / health office workflow</p>
            </div>
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ['Student Medical Profiles', 'Allergies, chronic conditions, doctors, insurance and treatment consent'],
              ['Visit Register', 'Routine checks, first aid, illness, injury and emergency encounters'],
              ['Medication Administration', 'Active medication schedules, dosage, route and completion status'],
              ['Emergency Readiness', 'Emergency instructions, guardian notification and referral tracking'],
            ].map(([title, description]) => (
              <div key={title} className="rounded-xl border border-surface-border p-5 hover:border-primary/30 transition-all">
                <h3 className="font-bold text-sm text-text-primary">{title}</h3>
                <p className="text-xs leading-5 text-text-secondary mt-2">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-card shadow-card border border-surface-border p-7">
          <h2 className="text-lg font-bold text-text-primary">Privacy Controls</h2>
          <p className="text-xs text-text-secondary mt-2 leading-5">Health information is scoped to the authenticated organization and school and is protected by dedicated health permissions.</p>
          <div className="mt-6 space-y-3">
            {['Organization isolation', 'School-level access', 'Audit trail for clinical records', 'Guardian notification tracking'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm font-semibold text-text-primary">
                <ShieldCheck className="w-4 h-4 text-primary" /> {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
