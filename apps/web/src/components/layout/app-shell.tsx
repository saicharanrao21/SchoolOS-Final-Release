import React from 'react';
import { Sidebar } from './sidebar';
import { Search, Bell, HelpCircle } from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-surface-background">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-surface-border flex items-center justify-between px-8 shadow-sm">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative w-full max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Global Search (Alt + S)"
                className="w-full bg-surface-background border border-surface-border rounded-button pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-5">
            <button className="p-2 text-text-muted hover:bg-surface-background rounded-full transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
            <button className="p-2 text-text-muted hover:bg-surface-background rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-surface-border mx-2"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right">
                <p className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors">John Doe</p>
                <p className="text-[10px] text-text-muted font-medium uppercase tracking-tighter">Administrator</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary shadow-lg shadow-primary/20 flex items-center justify-center text-white font-bold transition-transform group-active:scale-95">JD</div>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
