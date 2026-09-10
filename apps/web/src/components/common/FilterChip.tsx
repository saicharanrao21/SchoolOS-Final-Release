import React from 'react';
import { X } from 'lucide-react';

export interface FilterChipProps {
  label: string;
  value: string;
  onRemove: () => void;
}

export function FilterChip({ label, value, onRemove }: FilterChipProps) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-background border border-surface-border text-text-primary rounded-full text-xs font-semibold shadow-xs">
      <span className="text-text-muted font-normal">{label}:</span>
      <span>{value}</span>
      <button
        onClick={onRemove}
        className="text-text-muted hover:text-text-primary p-0.5 rounded-full transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
