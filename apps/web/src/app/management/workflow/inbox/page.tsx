import React from 'react';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Filter,
  Search,
  UserCheck,
  FileText
} from 'lucide-react';

export default function ApprovalInboxPage() {
  const pendingApprovals = [
    { id: 'WRK-00142', workflow: 'Purchase Order Approval', entity: 'PO-00142 (₹84,000)', requester: 'Robert Smith', step: 'Finance Approval', due: 'In 2 hours' },
    { id: 'WRK-00143', workflow: 'Leave Approval', entity: 'Casual Leave (3 days)', requester: 'Alice Johnson', step: 'Principal Review', due: 'Today' },
    { id: 'WRK-00144', workflow: 'Asset Disposal', entity: 'Old Lab Server', requester: 'Nexus Tech', step: 'Admin Clearance', due: 'Tomorrow' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Approval Inbox</h1>
          <p className="text-text-secondary text-sm">Review, approve, or request rework for institutional workflows</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-white border border-surface-border text-text-primary px-4 py-2.5 rounded-button font-bold text-sm hover:bg-surface-background transition-all flex items-center gap-2">
             <Filter className="w-4 h-4" />
             Filter
           </button>
        </div>
      </div>

      <div className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
        <div className="p-6 border-b border-surface-border flex items-center justify-between">
          <h3 className="font-bold text-text-primary flex items-center gap-2">
             <Inbox className="w-5 h-5 text-primary" />
             Pending Action ({pendingApprovals.length})
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type="text" placeholder="Search requests..." className="pl-10 pr-4 py-2 bg-surface-background border border-surface-border rounded-button text-xs focus:outline-none focus:border-primary w-64" />
          </div>
        </div>

        <div className="divide-y divide-surface-border">
          {pendingApprovals.map((req) => (
            <div key={req.id} className="p-6 hover:bg-surface-background/50 transition-colors flex items-center justify-between group">
              <div className="flex items-start gap-4">
                 <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <FileText className="w-6 h-6" />
                 </div>
                 <div>
                    <div className="flex items-center gap-3">
                       <span className="text-sm font-bold text-text-primary">{req.workflow}</span>
                       <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{req.id}</span>
                    </div>
                    <p className="text-xs font-medium text-text-secondary mt-1">{req.entity} • Requested by <span className="text-text-primary font-bold">{req.requester}</span></p>
                    <p className="text-[10px] text-text-muted mt-2 font-bold uppercase tracking-wider">Current Step: {req.step}</p>
                 </div>
              </div>

              <div className="flex items-center gap-6">
                 <div className="text-right">
                    <p className="text-xs font-bold text-orange-600 flex items-center gap-1 justify-end">
                       <Clock className="w-3 h-3" />
                       {req.due}
                    </p>
                    <p className="text-[10px] text-text-muted uppercase font-bold">SLA Target</p>
                 </div>
                 <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-button font-bold text-xs shadow-sm transition-all active:scale-95 flex items-center gap-1.5">
                       <CheckCircle2 className="w-4 h-4" />
                       Approve
                    </button>
                    <button className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-button font-bold text-xs transition-all active:scale-95 flex items-center gap-1.5">
                       <XCircle className="w-4 h-4" />
                       Reject
                    </button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
