import React from 'react';
import { clsx } from 'clsx';
import { LoadingSkeleton } from './LoadingSkeleton';

export interface CardProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
  density?: 'DEFAULT' | 'COMPACT';
}

export function Card({
  title,
  subtitle,
  action,
  footer,
  children,
  loading = false,
  className,
  density = 'DEFAULT',
}: CardProps) {
  const paddingClass = density === 'COMPACT' ? 'p-4' : 'p-6';

  return (
    <div
      className={clsx(
        'bg-white rounded-2xl border border-surface-border shadow-sm transition-all duration-200 overflow-hidden',
        className,
      )}
    >
      {(title || action) && (
        <div className={clsx('border-b border-surface-border flex items-center justify-between gap-4', paddingClass)}>
          <div>
            {title && <h3 className="font-bold text-text-primary text-base tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className={paddingClass}>
        {loading ? <LoadingSkeleton lines={3} /> : children}
      </div>

      {footer && (
        <div className={clsx('bg-surface-background border-t border-surface-border text-xs text-text-secondary', paddingClass)}>
          {footer}
        </div>
      )}
    </div>
  );
}
