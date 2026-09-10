'use client';

import React, { useState } from 'react';
import { PageHeader } from '../../../../components/common/PageHeader';
import { Card } from '../../../../components/common/Card';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { ShieldCheck, UserCheck, GitBranch, KeyRound, Search, Plus, CheckCircle2 } from 'lucide-react';
import { PERMISSION_REGISTRY_METADATA } from '../../../../lib/registries/permission-registry';

export default function PermissionsAdminPage() {
  const [activeTab, setActiveTab] = useState<'MEMBERSHIPS' | 'DELEGATIONS' | 'REGISTRY' | 'PREVIEW'>('MEMBERSHIPS');
  const [previewUserId, setPreviewUserId] = useState('');

  const mockMemberships = [
    { id: 'm-1', user: 'Dr. Sarah Connor', email: 'sarah.c@schoolos.test', role: 'PRINCIPAL', school: 'Main Campus', scope: 'SCHOOL', status: 'ACTIVE' },
    { id: 'm-2', user: 'Prof. Marcus Vance', email: 'marcus.v@schoolos.test', role: 'TEACHER', school: 'Main Campus', scope: 'CLASS', status: 'ACTIVE' },
    { id: 'm-3', user: 'Elena Rostova', email: 'elena.r@schoolos.test', role: 'ACCOUNTANT', school: 'North Branch', scope: 'SCHOOL', status: 'ACTIVE' },
  ];

  const mockDelegations = [
    { id: 'd-1', delegator: 'Dr. Sarah Connor', delegatee: 'Elena Rostova', permissions: ['finance.refund', 'workflow.approve'], validUntil: '30 Sep 2026', reason: 'Annual Leave Coverage', status: 'ACTIVE' },
  ];

  const registryItems = Object.values(PERMISSION_REGISTRY_METADATA);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Enterprise Identity & Policy Engine"
        subtitle="Manage multi-tenant school memberships, authority delegations, and effective access policies"
        badge="Zero Trust Policy"
        badgeVariant="SUCCESS"
        breadcrumbs={[
          { label: 'SchoolOS', href: '/management/dashboard' },
          { label: 'Security & Access Control' },
        ]}
      />

      {/* Navigation Tabs */}
      <div className="flex border-b border-surface-border bg-white rounded-2xl p-1.5 shadow-sm text-xs font-bold gap-2">
        <button
          onClick={() => setActiveTab('MEMBERSHIPS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'MEMBERSHIPS' ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <UserCheck className="w-4 h-4" /> User Memberships
        </button>
        <button
          onClick={() => setActiveTab('DELEGATIONS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'DELEGATIONS' ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <GitBranch className="w-4 h-4" /> Authority Delegations
        </button>
        <button
          onClick={() => setActiveTab('PREVIEW')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'PREVIEW' ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <KeyRound className="w-4 h-4" /> Effective Access Inspector
        </button>
        <button
          onClick={() => setActiveTab('REGISTRY')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'REGISTRY' ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Permission Registry
        </button>
      </div>

      {/* Tab 1: User Memberships */}
      {activeTab === 'MEMBERSHIPS' && (
        <Card title="Active Multi-Tenant Memberships" subtitle="Role assignments scoped to schools and campuses">
          <div className="divide-y divide-surface-border">
            {mockMemberships.map((m) => (
              <div key={m.id} className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-text-primary">{m.user}</p>
                  <p className="text-xs text-text-muted">{m.email} • {m.school}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-surface-background border border-surface-border text-text-primary rounded-full text-xs font-bold">
                    {m.role}
                  </span>
                  <StatusBadge status={m.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 2: Authority Delegations */}
      {activeTab === 'DELEGATIONS' && (
        <Card title="Temporary Authority Delegations" subtitle="Time-bound role and permission delegations between personnel">
          <div className="divide-y divide-surface-border">
            {mockDelegations.map((d) => (
              <div key={d.id} className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-text-primary">{d.delegator} ➔ {d.delegatee}</p>
                  <p className="text-xs text-text-muted">Reason: {d.reason} • Valid until {d.validUntil}</p>
                  <div className="flex gap-1.5 mt-2">
                    {d.permissions.map((p) => (
                      <span key={p} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold border border-blue-200">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <StatusBadge status={d.status} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 3: Effective Access Inspector ("Why does this user have access?") */}
      {activeTab === 'PREVIEW' && (
        <Card title="Effective Access Inspector" subtitle="Audit the exact User ➔ Membership ➔ Role ➔ Permission ➔ Scope ➔ Result resolution path">
          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={previewUserId}
                onChange={(e) => setPreviewUserId(e.target.value)}
                placeholder="Enter User Email or ID..."
                className="flex-1 bg-surface-background border border-surface-border rounded-xl px-4 py-2 text-xs font-semibold"
              />
              <button className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold">
                Inspect Effective Policy
              </button>
            </div>

            <div className="p-4 bg-surface-background rounded-2xl border border-surface-border space-y-3">
              <p className="text-xs font-bold text-text-primary">Resolution Tree Preview:</p>
              <div className="p-3 bg-white rounded-xl border text-xs space-y-2">
                <p className="font-bold text-primary">User: Dr. Sarah Connor (PRINCIPAL)</p>
                <p className="text-text-secondary font-medium">➔ Membership: SchoolOS Main Campus (SCHOOL Scope)</p>
                <p className="text-text-secondary font-medium">➔ Role: PRINCIPAL (Permissions: students.read, finance.approve, exams.publish)</p>
                <p className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Effective Access: Authorized for SchoolOS Main Campus
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 4: Canonical Permission Registry */}
      {activeTab === 'REGISTRY' && (
        <Card title="Canonical Typed Permission Registry" subtitle="Domain-resource-action permissions and scope classification">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {registryItems.map((p) => (
              <div key={p.key} className="p-3 bg-surface-background rounded-xl border border-surface-border flex items-start justify-between">
                <div>
                  <p className="font-bold text-xs text-primary">{p.key}</p>
                  <p className="text-[11px] text-text-secondary mt-0.5">{p.description}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                  p.risk === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-200' :
                  p.risk === 'HIGH' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {p.risk}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
