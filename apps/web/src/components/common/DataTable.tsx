'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  SlidersHorizontal,
  Check,
  Download,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import { LoadingSkeleton } from './LoadingSkeleton';
import { EmptyState } from './EmptyState';
import { clsx } from 'clsx';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface BulkAction<T> {
  key: string;
  label: string;
  icon?: React.ReactNode;
  isDestructive?: boolean;
  onClick: (selectedRows: T[]) => void;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  loading?: boolean;
  page?: number;
  limit?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSortChange?: (column: string, direction: 'asc' | 'desc') => void;
  bulkActions?: BulkAction<T>[];
  density?: 'DEFAULT' | 'COMPACT';
  onDensityChange?: (density: 'DEFAULT' | 'COMPACT') => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  page = 1,
  limit = 10,
  total = 0,
  onPageChange,
  onLimitChange,
  sortColumn,
  sortDirection,
  onSortChange,
  bulkActions = [],
  density = 'DEFAULT',
  onDensityChange,
  emptyTitle,
  emptyDescription,
}: DataTableProps<T>) {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [showColMenu, setShowColMenu] = useState(false);

  const totalPages = Math.ceil(total / limit) || 1;
  const visibleColumns = columns.filter((c) => !hiddenColumns.has(c.key));

  const allSelected = data.length > 0 && data.every((row) => selectedKeys.has(keyExtractor(row)));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(data.map(keyExtractor)));
    }
  };

  const toggleSelectRow = (key: string) => {
    const next = new Set(selectedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelectedKeys(next);
  };

  const handleSort = (colKey: string) => {
    if (!onSortChange) return;
    if (sortColumn === colKey) {
      onSortChange(colKey, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(colKey, 'asc');
    }
  };

  const selectedRows = data.filter((row) => selectedKeys.has(keyExtractor(row)));
  const paddingClass = density === 'COMPACT' ? 'px-3 py-2 text-xs' : 'px-4 py-3.5 text-xs';

  return (
    <div className="space-y-3">
      {/* Table Controls */}
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="text-text-muted font-medium">
          Showing <span className="font-bold text-text-primary">{data.length}</span> of{' '}
          <span className="font-bold text-text-primary">{total || data.length}</span> entries
        </div>

        <div className="flex items-center gap-2">
          {/* Density Toggle */}
          {onDensityChange && (
            <div className="flex items-center border border-surface-border rounded-lg bg-white p-0.5 shadow-2xs">
              <button
                onClick={() => onDensityChange('DEFAULT')}
                className={clsx(
                  'px-2.5 py-1 rounded-md font-semibold text-[11px] transition-all',
                  density === 'DEFAULT' ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:text-text-primary',
                )}
              >
                Default
              </button>
              <button
                onClick={() => onDensityChange('COMPACT')}
                className={clsx(
                  'px-2.5 py-1 rounded-md font-semibold text-[11px] transition-all',
                  density === 'COMPACT' ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:text-text-primary',
                )}
              >
                Compact
              </button>
            </div>
          )}

          {/* Column Visibility Selector */}
          <div className="relative">
            <button
              onClick={() => setShowColMenu(!showColMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-surface-border bg-white rounded-lg text-text-secondary hover:bg-surface-hover font-semibold shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> Columns
            </button>

            {showColMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-surface-border rounded-xl shadow-lg z-50 p-2 space-y-1 animate-in fade-in duration-200">
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-2 py-1">Visible Columns</div>
                {columns.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => {
                      const next = new Set(hiddenColumns);
                      if (next.has(c.key)) next.delete(c.key);
                      else next.add(c.key);
                      setHiddenColumns(next);
                    }}
                    className="flex items-center justify-between w-full px-2 py-1.5 text-xs text-left rounded-lg hover:bg-surface-hover font-medium text-text-primary"
                  >
                    <span>{c.header}</span>
                    {!hiddenColumns.has(c.key) && <Check className="w-3.5 h-3.5 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedKeys.size > 0 && bulkActions.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-white rounded-2xl shadow-lg animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[11px] font-bold">
              {selectedKeys.size}
            </span>
            <span>selected</span>
          </div>

          <div className="flex items-center gap-2">
            {bulkActions.map((act) => (
              <button
                key={act.key}
                onClick={() => act.onClick(selectedRows)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                  act.isDestructive
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white',
                )}
              >
                {act.icon}
                <span>{act.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-surface-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-background border-b border-surface-border text-[11px] font-bold uppercase tracking-wider text-text-muted sticky top-0 z-10">
              <tr>
                {bulkActions.length > 0 && (
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="rounded border-surface-border text-primary focus:ring-primary/20"
                    />
                  </th>
                )}
                {visibleColumns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={clsx(
                      'px-4 py-3 transition-colors',
                      col.sortable && 'cursor-pointer hover:text-text-primary select-none',
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center',
                    )}
                    style={{ width: col.width }}
                  >
                    <div
                      className={clsx(
                        'flex items-center gap-1.5',
                        col.align === 'right' && 'justify-end',
                        col.align === 'center' && 'justify-center',
                      )}
                    >
                      <span>{col.header}</span>
                      {col.sortable && sortColumn === col.key && (
                        sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-primary" /> : <ChevronDown className="w-3.5 h-3.5 text-primary" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-surface-border text-text-primary">
              {loading ? (
                <tr>
                  <td colSpan={visibleColumns.length + (bulkActions.length > 0 ? 1 : 0)} className="p-8">
                    <LoadingSkeleton lines={5} />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + (bulkActions.length > 0 ? 1 : 0)}>
                    <EmptyState title={emptyTitle} description={emptyDescription} />
                  </td>
                </tr>
              ) : (
                data.map((row) => {
                  const key = keyExtractor(row);
                  const isSelected = selectedKeys.has(key);

                  return (
                    <tr
                      key={key}
                      className={clsx(
                        'transition-colors hover:bg-surface-hover/80',
                        isSelected && 'bg-blue-50/40',
                      )}
                    >
                      {bulkActions.length > 0 && (
                        <td className="w-10 px-4 py-3.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(key)}
                            className="rounded border-surface-border text-primary focus:ring-primary/20"
                          />
                        </td>
                      )}
                      {visibleColumns.map((col) => (
                        <td
                          key={col.key}
                          className={clsx(
                            paddingClass,
                            'font-medium',
                            col.align === 'right' && 'text-right',
                            col.align === 'center' && 'text-center',
                          )}
                        >
                          {col.render ? col.render(row) : (row as any)[col.key]}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Server Pagination */}
        {onPageChange && (
          <div className="px-4 py-3 bg-surface-background border-t border-surface-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-text-muted font-medium">Rows per page:</span>
              <select
                value={limit}
                onChange={(e) => onLimitChange && onLimitChange(Number(e.target.value))}
                className="bg-white border border-surface-border rounded-lg px-2 py-1 font-bold text-text-primary focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-text-muted font-medium mr-2">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page <= 1}
                onClick={() => onPageChange(1)}
                className="p-1.5 rounded-lg border border-surface-border bg-white text-text-secondary disabled:opacity-40 hover:bg-surface-hover"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="p-1.5 rounded-lg border border-surface-border bg-white text-text-secondary disabled:opacity-40 hover:bg-surface-hover"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="p-1.5 rounded-lg border border-surface-border bg-white text-text-secondary disabled:opacity-40 hover:bg-surface-hover"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => onPageChange(totalPages)}
                className="p-1.5 rounded-lg border border-surface-border bg-white text-text-secondary disabled:opacity-40 hover:bg-surface-hover"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
