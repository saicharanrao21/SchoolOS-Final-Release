'use client';

import React, { useState } from 'react';
import {
  Building,
  ShieldCheck,
  Zap,
  Users,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Search,
  Plus,
  Radio,
  ArrowUpRight,
  TrendingUp,
  Activity
} from 'lucide-react';

export default function PlatformDashboardPage() {
  const [filter, setFilter] = useState('ALL');

  const kpis = [
    { label: 'Total SaaS Tenants', value: '142', change: '+12 this month', icon: Building, color: 'bg-indigo-600' },
    { label: 'Active Subscriptions', value: '128', change: '86% Conversion', icon: ShieldCheck, color: 'bg-green-600' },
    { label: 'Total Platform Students', value: '48,250', change: 'Across all tenants', icon: Users, color: 'bg-blue-600' },
    { label: 'Monthly Recurring Revenue', value: '$38,200', change: '+18% YoY', icon: TrendingUp, color: 'bg-purple-600' },
  ];

  const tenants = [
    { id: 'org-1', name: 'Greenwood International Schools', code: 'GREENWOOD', schools: 3, students: '2,450', plan: 'Enterprise Growth', status: 'ACTIVE', joinedDate: '2025-01-15' },
    { id: 'org-2', name: 'Oakridge Academy Network', code: 'OAKRIDGE', schools: 5, students: '4,120', plan: 'Enterprise Growth', status: 'ACTIVE', joinedDate: '2025-03-20' },
    { id: 'org-3', name: 'St. Marks Grammar School', code: 'STMARKS', schools: 1, students: '420', plan: 'Starter Plan', status: 'TRIAL', joinedDate: '2026-08-28' },
    { id: 'org-4', name: 'Beacon Hill Prep', code: 'BEACON', schools: 2, students: '1,100', plan: 'Enterprise Growth', status: 'SUSPENDED', joinedDate: '2025-06-10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Superadmin Platform Control Plane</h1>
          <p className="text-text-secondary text-sm">Centralized SaaS tenant management, subscription oversight, feature flags, and platform health</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Onboard New Tenant
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white p-6 rounded-card shadow-card border border-surface-border transition-all hover:border-primary/20">
            <div className="flex justify-between items-start mb-4">
              <div className={`${kpi.color} p-3 rounded-xl text-white shadow-lg shadow-current/10`}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest bg-surface-background px-2 py-0.5 rounded border border-surface-border">
                {kpi.change}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">{kpi.label}</p>
              <p className="text-3xl font-bold text-text-primary mt-1">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tenant Directory Table */}
      <div className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
        <div className="p-6 border-b border-surface-border flex items-center justify-between">
          <h3 className="font-bold text-text-primary text-lg flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" />
            Registered SaaS Tenants
          </h3>
          <div className="flex gap-2">
            {['ALL', 'ACTIVE', 'TRIAL', 'SUSPENDED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                  filter === st
                    ? 'bg-primary text-white shadow'
                    : 'text-text-muted hover:bg-surface-background'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-surface-background border-b border-surface-border text-xs uppercase text-text-muted font-bold">
            <tr>
              <th className="p-4">Tenant Organization</th>
              <th className="p-4">Code</th>
              <th className="p-4">Schools / Campuses</th>
              <th className="p-4">Total Students</th>
              <th className="p-4">SaaS Plan</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {tenants
              .filter((t) => filter === 'ALL' || t.status === filter)
              .map((tenant) => (
                <tr key={tenant.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-text-primary">{tenant.name}</td>
                  <td className="p-4 font-mono text-xs text-text-muted">{tenant.code}</td>
                  <td className="p-4 font-semibold text-xs text-text-secondary">{tenant.schools} Schools</td>
                  <td className="p-4 font-bold text-text-primary">{tenant.students}</td>
                  <td className="p-4 text-xs font-semibold text-primary">{tenant.plan}</td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                        tenant.status === 'ACTIVE'
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : tenant.status === 'TRIAL'
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-red-50 border-red-200 text-red-700'
                      }`}
                    >
                      {tenant.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-primary font-bold text-xs hover:underline flex items-center gap-1 ml-auto">
                      Manage <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
