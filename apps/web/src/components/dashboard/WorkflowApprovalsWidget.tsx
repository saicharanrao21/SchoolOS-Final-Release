import React from 'react';
import { Card } from '../common/Card';
import { GitBranch, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function WorkflowApprovalsWidget() {
  const approvals = [
    { id: '1', title: 'Purchase Requisition #PR-901', subtitle: 'Science Lab Consumables ($850)', requester: 'Dr. Sarah Connor' },
    { id: '2', title: 'Leave Application #LV-104', subtitle: 'Medical Leave (3 Days)', requester: 'Prof. Marcus Vance' },
  ];

  return (
    <Card
      title="Pending Workflow Approvals"
      subtitle="Requisitions & applications requiring your authorization"
      action={
        <Link href="/management/workflow/inbox" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
          Inbox <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      <div className="space-y-2.5">
        {approvals.map((item) => (
          <div key={item.id} className="p-3 rounded-xl border border-surface-border bg-surface-background/40 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-text-primary">{item.title}</p>
              <p className="text-[11px] text-text-secondary">{item.subtitle} • {item.requester}</p>
            </div>
            <Link
              href="/management/workflow/inbox"
              className="px-3 py-1.5 bg-primary text-white text-[11px] font-bold rounded-lg hover:bg-primary-hover transition-colors shrink-0"
            >
              Review
            </Link>
          </div>
        ))}
      </div>
    </Card>
  );
}
