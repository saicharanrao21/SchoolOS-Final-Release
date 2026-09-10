import React from 'react';
import { clsx } from 'clsx';

export interface StatusBadgeProps {
  status: string;
  variant?: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO' | 'NEUTRAL';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, variant, size = 'sm' }: StatusBadgeProps) {
  const getVariant = () => {
    if (variant) return variant;
    const s = status.toUpperCase();
    if (['ACTIVE', 'SUCCESS', 'PAID', 'PUBLISHED', 'COMPLETED', 'APPROVED', 'PRESENT', 'ONLINE'].includes(s)) {
      return 'SUCCESS';
    }
    if (['PENDING', 'WARNING', 'PARTIALLY_PAID', 'UNDER_REVIEW', 'SUBMITTED', 'IN_PROGRESS', 'LATE'].includes(s)) {
      return 'WARNING';
    }
    if (['INACTIVE', 'ERROR', 'FAILED', 'REJECTED', 'OVERDUE', 'CANCELLED', 'ABSENT', 'OFFLINE'].includes(s)) {
      return 'ERROR';
    }
    if (['INFO', 'DRAFT', 'PRE_REGISTERED', 'SCHEDULING'].includes(s)) {
      return 'INFO';
    }
    return 'NEUTRAL';
  };

  const v = getVariant();

  const styles = {
    SUCCESS: 'bg-green-50 text-green-700 border-green-200',
    WARNING: 'bg-amber-50 text-amber-800 border-amber-200',
    ERROR: 'bg-red-50 text-red-700 border-red-200',
    INFO: 'bg-blue-50 text-blue-700 border-blue-200',
    NEUTRAL: 'bg-slate-100 text-slate-700 border-slate-200',
  }[v];

  return (
    <span
      className={clsx(
        'inline-flex items-center font-bold rounded-full border uppercase tracking-wider',
        size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
        styles,
      )}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}
