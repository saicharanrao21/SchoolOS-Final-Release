import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Unable to load data',
  message = 'An unexpected error occurred while communicating with SchoolOS services.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-red-50/50 rounded-2xl border border-red-200 text-red-900 my-4">
      <div className="w-12 h-12 rounded-2xl bg-white border border-red-200 flex items-center justify-center text-red-600 shadow-sm mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="font-bold text-base mb-1">{title}</h4>
      <p className="text-xs text-red-700 max-w-md mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <RefreshCcw className="w-3.5 h-3.5" /> Retry Request
        </button>
      )}
    </div>
  );
}
