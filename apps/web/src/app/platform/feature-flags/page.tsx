'use client';

import React from 'react';
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ShieldCheck,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export default function FeatureFlagsPage() {
  const flags = [
    { key: 'enable_ai_report_summaries', name: 'AI Report Card Summaries', description: 'Enable Gemini AI report card commentary generation for teachers', enabled: true, rollout: '100%' },
    { key: 'enable_whatsapp_gateway_v2', name: 'WhatsApp Meta Cloud Gateway V2', description: 'Enable direct WhatsApp Cloud API delivery for transport & security alerts', enabled: true, rollout: '50%' },
    { key: 'enable_bi_predictive_analytics', name: 'Predictive Fee Churn BI Engine', description: 'Enable predictive analytics machine learning models in BI dashboard', enabled: false, rollout: '0%' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Platform Feature Flags</h1>
          <p className="text-text-secondary text-sm">Control feature rollouts, beta capabilities, and targeted tenant toggles across the platform</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Feature Flag
          </button>
        </div>
      </div>

      <div className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-background border-b border-surface-border text-xs uppercase text-text-muted font-bold">
            <tr>
              <th className="p-4">Flag Key</th>
              <th className="p-4">Name</th>
              <th className="p-4">Description</th>
              <th className="p-4">Rollout %</th>
              <th className="p-4">State</th>
              <th className="p-4 text-right">Toggle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {flags.map((f) => (
              <tr key={f.key} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-mono text-xs font-bold text-primary">{f.key}</td>
                <td className="p-4 font-bold text-text-primary">{f.name}</td>
                <td className="p-4 text-xs text-text-muted">{f.description}</td>
                <td className="p-4 font-bold text-xs text-text-secondary">{f.rollout}</td>
                <td className="p-4">
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                    f.enabled ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-100 border-slate-200 text-slate-600'
                  }`}>
                    {f.enabled ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-primary hover:text-primary-dark font-bold text-sm">
                    {f.enabled ? <ToggleRight className="w-6 h-6 text-green-600 ml-auto" /> : <ToggleLeft className="w-6 h-6 text-slate-400 ml-auto" />}
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
