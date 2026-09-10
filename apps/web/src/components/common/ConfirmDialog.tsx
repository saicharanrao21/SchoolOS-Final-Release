import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-surface-border p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDestructive ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-blue-50 text-primary border border-blue-200'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-text-primary text-base">{title}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-text-muted hover:text-text-primary rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-text-secondary leading-relaxed">{message}</p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-text-secondary border border-surface-border rounded-xl hover:bg-surface-hover transition-all"
          >
            {cancelText}
          </button>
          <button
            disabled={isLoading}
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-bold text-white rounded-xl transition-all shadow-sm ${
              isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary-hover'
            }`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
