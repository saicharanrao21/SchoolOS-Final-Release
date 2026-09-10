import React from 'react';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = 'No records found',
  description = 'There are no items matching your criteria in this view.',
  action,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 my-4 bg-surface-background/50 rounded-2xl border border-dashed border-surface-border">
      <div className="w-12 h-12 rounded-2xl bg-white border border-surface-border flex items-center justify-center text-text-muted shadow-sm mb-3">
        {icon || <Inbox className="w-6 h-6 text-text-muted" />}
      </div>
      <h4 className="font-bold text-text-primary text-base mb-1">{title}</h4>
      <p className="text-xs text-text-secondary max-w-sm mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
