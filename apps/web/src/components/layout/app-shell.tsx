'use client';

import React, { useState } from 'react';
import { Sidebar } from './sidebar';
import { Search, Bell, Sparkles, UserCheck, CheckCircle2 } from 'lucide-react';
import { WorkspaceContextSwitcher } from '../common/WorkspaceContextSwitcher';
import { CommandPalette } from '../common/CommandPalette';
import { NotificationCenterDrawer } from '../common/NotificationCenterDrawer';
import { ToastProvider } from '../common/ToastProvider';
import { WorkspaceContext, getStoredWorkspaceContext, saveStoredWorkspaceContext, WorkspaceContextState } from '../../lib/stores/workspace-context';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [workspaceCtx, setWorkspaceCtx] = useState<WorkspaceContextState>(getStoredWorkspaceContext());
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  const switchSchool = (schoolId: string, schoolName: string) => {
    setWorkspaceCtx((prev) => {
      const next = { ...prev, schoolId, schoolName };
      saveStoredWorkspaceContext(next);
      return next;
    });
  };

  const switchAcademicYear = (academicYearId: string, academicYearName: string) => {
    setWorkspaceCtx((prev) => {
      const next = { ...prev, academicYearId, academicYearName };
      saveStoredWorkspaceContext(next);
      return next;
    });
  };

  return (
    <WorkspaceContext.Provider
      value={{
        context: workspaceCtx,
        setContext: setWorkspaceCtx,
        switchSchool,
        switchAcademicYear,
      }}
    >
      <ToastProvider>
        <div className="flex h-screen bg-surface-background text-text-primary antialiased font-sans">
          <Sidebar />

          <main className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="h-16 bg-white border-b border-surface-border flex items-center justify-between px-6 shadow-xs z-20 shrink-0">
              <div className="flex items-center gap-4 flex-1">
                {/* Workspace / School / Academic Year Context Switcher */}
                <WorkspaceContextSwitcher />

                {/* Global Command Search Launcher */}
                <button
                  onClick={() => setShowCommandPalette(true)}
                  className="hidden sm:flex items-center gap-3 bg-surface-background border border-surface-border hover:border-primary/40 rounded-xl px-3.5 py-1.5 text-xs text-text-muted hover:text-text-primary transition-all shadow-2xs group w-full max-w-sm"
                >
                  <Search className="w-3.5 h-3.5 text-text-muted group-hover:text-primary" />
                  <span className="font-semibold text-text-secondary">Search or type command...</span>
                  <kbd className="ml-auto px-1.5 py-0.5 text-[10px] font-bold text-text-muted bg-white border border-surface-border rounded-md shadow-2xs">
                    ⌘K
                  </kbd>
                </button>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-3">
                {/* Notifications Button */}
                <button
                  onClick={() => setShowNotifDrawer(true)}
                  className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-hover rounded-xl transition-colors relative"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="h-6 w-px bg-surface-border mx-1"></div>

                {/* User Menu */}
                <div className="flex items-center gap-2.5 cursor-pointer group">
                  <div className="text-right hidden md:block">
                    <p className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors">
                      Administrator
                    </p>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                      SUPER_ADMIN
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-primary shadow-md shadow-primary/20 flex items-center justify-center text-white font-bold text-xs transition-transform group-active:scale-95">
                    SA
                  </div>
                </div>
              </div>
            </header>

            {/* Page Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
              {children}
            </div>
          </main>

          {/* Global Command Center Palette (Cmd+K) */}
          <CommandPalette isOpen={showCommandPalette} onClose={() => setShowCommandPalette(false)} />

          {/* Global Notification Drawer */}
          <NotificationCenterDrawer isOpen={showNotifDrawer} onClose={() => setShowNotifDrawer(false)} />
        </div>
      </ToastProvider>
    </WorkspaceContext.Provider>
  );
}
