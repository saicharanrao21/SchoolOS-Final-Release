'use client';

import React, { useState } from 'react';
import { PageHeader } from '../../../../components/common/PageHeader';
import { Card } from '../../../../components/common/Card';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { FilterBar } from '../../../../components/common/FilterBar';
import { CheckCircle2, XCircle, Clock, FileText } from 'lucide-react';

export default function ApprovalInboxPage() {
  const [search, setSearch] = useState('');

  const pendingApprovals = [
    { id: 'WRK-00142', workflow: 'Purchase Order Approval', entity: 'PO-00142 ($1,200)', requester: 'Robert Smith', step: 'Finance Approval', due: 'In 2 hours', status: 'PENDING' },
    { id: 'WRK-00143', workflow: 'Staff Leave Approval', entity: 'Casual Leave (3 days)', requester: 'Alice Johnson', step: 'Principal Review', due: 'Today', status: 'PENDING' },
    { id: 'WRK-00144', workflow: 'Asset Disposal Clearance', entity: 'Old Lab Server', requester: 'Nexus Tech', step: 'Admin Clearance', due: 'Tomorrow', status: 'PENDING' },
  ];

  const filtered = pendingApprovals.filter((req) =>
    `${req.workflow} ${req.entity} ${req.requester} ${req.id}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Approval Inbox & Workflow Engine"
        subtitle="Review, approve, or reject multi-level requisitions, leave requests, and administrative approvals"
        badge="Multi-Level Chain"
        badgeVariant="SUCCESS"
        breadcrumbs={[
          { label: 'SchoolOS', href: '/management/dashboard' },
          { label: 'Workflows' },
          { label: 'Approval Inbox' },
        ]}
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter workflow ID, requester, or entity..."
      />

      <Card title="Pending Authorization Requisitions">
        <div className="divide-y divide-surface-border text-xs">
          {filtered.map((req) => (
            <div key={req.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-medium">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-blue-50 border border-blue-200 text-primary rounded-xl shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-text-primary text-sm">{req.workflow}</p>
                    <span className="px-2 py-0.5 bg-surface-background border border-surface-border text-primary font-bold text-[10px] rounded-md">
                      {req.id}
                    </span>
                  </div>
                  <p className="text-text-muted mt-0.5">{req.entity} • Requested by <span className="text-text-primary font-bold">{req.requester}</span></p>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">Current Step: {req.step}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className="font-bold text-amber-700 flex items-center gap-1 justify-end">
                    <Clock className="w-3.5 h-3.5" /> {req.due}
                  </p>
                  <p className="text-[10px] text-text-muted font-bold uppercase">SLA Target</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold">
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
