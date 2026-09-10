'use client';

import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'SUCCESS' | 'ERROR' | 'INFO' | 'WARNING';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

export interface ToastContextValue {
  showToast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (type: ToastType, title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-300"
          >
            {t.type === 'SUCCESS' && <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />}
            {t.type === 'ERROR' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
            {t.type === 'WARNING' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {t.type === 'INFO' && <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}

            <div className="flex-1 space-y-0.5">
              <p className="font-bold text-xs">{t.title}</p>
              {t.message && <p className="text-[11px] text-slate-300 leading-normal">{t.message}</p>}
            </div>

            <button onClick={() => removeToast(t.id)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
