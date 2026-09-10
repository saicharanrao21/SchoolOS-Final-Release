import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO' | 'NEUTRAL';
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  badge,
  badgeVariant = 'INFO',
  breadcrumbs,
  actions,
}: PageHeaderProps) {
  return (
    <div className="space-y-2 mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-text-muted font-medium mb-1">
          {breadcrumbs.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="w-3 h-3 text-text-muted/60" />}
              {item.href ? (
                <Link href={item.href} className="hover:text-primary transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-text-secondary font-semibold">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">{title}</h1>
            {badge && <StatusBadge status={badge} variant={badgeVariant} />}
          </div>
          {subtitle && <p className="text-sm text-text-secondary max-w-2xl">{subtitle}</p>}
        </div>

        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
