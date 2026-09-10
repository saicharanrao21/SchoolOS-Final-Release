'use client';

import React from 'react';
import {
  Check,
  Zap,
  Building,
  Users,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';

export default function SaaSPlansPage() {
  const plans = [
    {
      code: 'STARTER',
      name: 'Starter Plan',
      price: '$99',
      period: '/ month',
      description: 'Ideal for single-campus schools starting digital operations.',
      limits: 'Up to 250 Students • 25 Staff • 1 Campus',
      features: ['Core Admissions & CRM', 'Student Lifecycle', 'Fee Collection & Receipting', 'In-App Notifications', 'Standard Reports'],
      current: false,
    },
    {
      code: 'ENTERPRISE',
      name: 'Enterprise Growth Plan',
      price: '$299',
      period: '/ month',
      description: 'Complete ERP suite for growing multi-campus institutions.',
      limits: 'Up to 1,000 Students • 100 Staff • 5 Campuses',
      features: ['Everything in Starter', 'Double-Entry Accounting & Ledger', 'HR & Payroll Management', 'Transport GPS & Child Safety', 'Multi-Channel Broadcasts & SMS/WhatsApp', 'Workflow Approvals & Automation Engine', 'Enterprise BI & Analytics'],
      current: true,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl font-extrabold text-text-primary">Flexible SaaS Plans for Every Institution</h1>
        <p className="text-text-secondary text-sm">Scale your digital school operations seamlessly. Upgrade or adjust your subscription anytime.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-6">
        {plans.map((p) => (
          <div
            key={p.code}
            className={`bg-white rounded-card shadow-xl p-8 border-2 relative flex flex-col justify-between ${
              p.current ? 'border-primary ring-4 ring-primary/10' : 'border-surface-border'
            }`}
          >
            {p.current && (
              <span className="absolute -top-3.5 right-6 bg-primary text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow">
                Current Active Plan
              </span>
            )}
            <div>
              <h3 className="text-xl font-extrabold text-text-primary">{p.name}</h3>
              <p className="text-xs text-text-muted mt-2">{p.description}</p>
              <div className="my-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-text-primary">{p.price}</span>
                <span className="text-xs text-text-muted font-bold">{p.period}</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-background border border-surface-border text-xs font-bold text-primary mb-6">
                {p.limits}
              </div>
              <ul className="space-y-3 text-xs text-text-secondary font-medium">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              disabled={p.current}
              className={`w-full mt-8 py-3 rounded-button font-bold text-xs shadow transition-all ${
                p.current
                  ? 'bg-surface-background text-text-muted cursor-default'
                  : 'bg-primary text-white hover:bg-primary-dark active:scale-95'
              }`}
            >
              {p.current ? 'Active Subscription' : 'Upgrade to ' + p.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
