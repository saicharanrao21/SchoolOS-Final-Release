'use client';

import React from 'react';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { FilterChip } from './FilterChip';

export interface FilterOption {
  key: string;
  label: string;
  value: string;
  type?: 'select' | 'text' | 'date';
  options?: { label: string; value: string }[];
}

export interface FilterBarProps {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  filters?: FilterOption[];
  activeFilters?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  onClearAll?: () => void;
  searchPlaceholder?: string;
}

export function FilterBar({
  searchQuery = '',
  onSearchChange,
  filters = [],
  activeFilters = {},
  onFilterChange,
  onClearAll,
  searchPlaceholder = 'Search records...',
}: FilterBarProps) {
  const activeCount = Object.keys(activeFilters).filter((k) => activeFilters[k]).length;

  return (
    <div className="space-y-3 mb-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Field */}
        {onSearchChange && (
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-white border border-surface-border rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        )}

        {/* Dropdown Select Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => (
            <select
              key={f.key}
              value={activeFilters[f.key] || ''}
              onChange={(e) => onFilterChange && onFilterChange(f.key, e.target.value)}
              className="bg-white border border-surface-border rounded-xl px-3 py-2 text-xs font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
            >
              <option value="">{f.label}: All</option>
              {f.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}

          {activeCount > 0 && onClearAll && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear ({activeCount})
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {Object.entries(activeFilters).map(([k, v]) => {
            if (!v) return null;
            const filterDef = filters.find((f) => f.key === k);
            const label = filterDef ? filterDef.label : k;
            const optLabel = filterDef?.options?.find((o) => o.value === v)?.label || v;

            return (
              <FilterChip
                key={k}
                label={label}
                value={optLabel}
                onRemove={() => onFilterChange && onFilterChange(k, '')}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
