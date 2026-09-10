'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Building,
  Users,
  HardDrive,
  Download,
  Plus
} from 'lucide-react';

export default function BillingDashboardPage() {
  const subscription = {
    planName: 'Enterprise Growth Plan',
    planCode: 'ENTERPRISE',
    status: 'ACTIVE',
    billingCycle: 'YEARLY',
    amount: '$2,990.00 / yr',
    renewalDate: '2027-09-01',
    organization: 'SchoolOS Enterprise Systems',
  };

  const usageLimits = [
    { label: 'Active Students', current: 482, max: 1000, unit: 'students', percent: 48 },
    { label: 'Staff & Teachers', current: 45, max: 100, unit: 'staff', percent: 45 },
    { label: 'Campuses', current: 2, max: 5, unit: 'campuses', percent: 40 },
    { label: 'Document Storage', current: 12.4, max: 50, unit: 'GB', percent: 25 },
  ];

  const recentInvoices = [
    { id: 'inv-1', number: 'INV-SAAS-2026-000001', date: '2026-09-01', amount: '$2,990.00', status: 'PAID' },
    { id: 'inv-2', number: 'INV-SAAS-2025-000012', date: '2025-09-01', amount: '$2,990.00', status: 'PAID' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">SaaS Billing & Subscriptions</h1>
          <p className="text-text-secondary text-sm">Platform subscription status, plan limits, usage entitlements, and billing history</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Subscription Status Card */}
      <div className="bg-gradient-to-r from-slate-900 via-primary-dark to-slate-800 text-white p-8 rounded-card shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-wrap justify-between items-start gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="bg-green-500/20 text-green-300 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border border-green-500/30 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                {subscription.status} SUBSCRIPTION
              </span>
              <span className="text-xs text-white/70 font-bold">{subscription.billingCycle} BILLING</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">{subscription.planName}</h2>
            <p className="text-sm text-white/80">{subscription.organization} • Renews on {subscription.renewalDate}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/70 uppercase font-bold tracking-wider">Annual Price</p>
            <p className="text-3xl font-extrabold mt-1">{subscription.amount}</p>
          </div>
        </div>
      </div>

      {/* Usage Entitlements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {usageLimits.map((u) => (
          <div key={u.label} className="bg-white p-6 rounded-card shadow-card border border-surface-border">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-text-muted">{u.label}</span>
              <span className="text-xs font-extrabold text-primary">{u.current} / {u.max} {u.unit}</span>
            </div>
            <div className="w-full h-2.5 bg-surface-background rounded-full overflow-hidden border border-surface-border mt-3">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${u.percent}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-card shadow-card border border-surface-border p-6">
        <h3 className="font-bold text-text-primary text-lg mb-6 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          Platform Billing Invoices
        </h3>
        <div className="space-y-4">
          {recentInvoices.map((inv) => (
            <div key={inv.id} className="p-4 rounded-xl border border-surface-border bg-surface-background flex items-center justify-between hover:border-primary/30 transition-all">
              <div>
                <p className="font-bold text-sm text-text-primary">{inv.number}</p>
                <p className="text-xs text-text-muted mt-1">Issued: {inv.date}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-text-primary">{inv.amount}</span>
                <span className="bg-green-50 border border-green-200 text-green-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                  {inv.status}
                </span>
                <button className="text-primary font-bold text-xs hover:underline flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" />
                  PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
