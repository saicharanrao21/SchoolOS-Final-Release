'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  BookOpen,
  Users,
  Wallet,
  Calendar,
  CheckCircle,
  FileText,
  Bus,
  Settings,
  Shield,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export interface CommandItem {
  id: string;
  category: 'NAVIGATION' | 'ACTIONS' | 'RECENT';
  title: string;
  subtitle?: string;
  href?: string;
  action?: () => void;
  icon?: React.ReactNode;
  permission?: string;
}

const COMMAND_REGISTRY: CommandItem[] = [
  { id: 'nav-dashboard', category: 'NAVIGATION', title: 'Go to Dashboard', href: '/management/dashboard', icon: <BookOpen className="w-4 h-4 text-primary" /> },
  { id: 'nav-students', category: 'NAVIGATION', title: 'Student Directory', href: '/management/students', icon: <Users className="w-4 h-4 text-blue-500" /> },
  { id: 'nav-finance', category: 'NAVIGATION', title: 'Collect Fees', href: '/management/finance/collect', icon: <Wallet className="w-4 h-4 text-green-500" /> },
  { id: 'nav-attendance', category: 'NAVIGATION', title: 'Mark Class Attendance', href: '/management/attendance/mark', icon: <CheckCircle className="w-4 h-4 text-indigo-500" /> },
  { id: 'nav-timetables', category: 'NAVIGATION', title: 'Academic Timetables', href: '/management/academics/timetables', icon: <Calendar className="w-4 h-4 text-purple-500" /> },
  { id: 'nav-transport', category: 'NAVIGATION', title: 'Transport Routes & Trips', href: '/management/transport/routes', icon: <Bus className="w-4 h-4 text-amber-500" /> },
  { id: 'nav-security', category: 'NAVIGATION', title: 'Gate Visitor Security', href: '/management/security/dashboard', icon: <Shield className="w-4 h-4 text-red-500" /> },
  { id: 'nav-settings', category: 'NAVIGATION', title: 'School Settings', href: '/management/settings', icon: <Settings className="w-4 h-4 text-slate-500" /> },
  { id: 'act-new-student', category: 'ACTIONS', title: 'Enroll New Student', href: '/management/students/new', icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
  { id: 'act-fee-structure', category: 'ACTIONS', title: 'Configure Fee Structure', href: '/management/finance/fee-structures', icon: <FileText className="w-4 h-4 text-emerald-500" /> },
];

export function CommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = COMMAND_REGISTRY.filter((cmd) =>
    `${cmd.title} ${cmd.subtitle || ''}`.toLowerCase().includes(query.toLowerCase()),
  );

  const handleSelect = (cmd: CommandItem) => {
    onClose();
    if (cmd.action) {
      cmd.action();
    } else if (cmd.href) {
      router.push(cmd.href);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-surface-border overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Search Header */}
        <div className="p-4 border-b border-surface-border flex items-center gap-3">
          <Search className="w-5 h-5 text-primary shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, module, or search term..."
            autoFocus
            className="w-full text-sm font-semibold text-text-primary focus:outline-none placeholder:text-text-muted"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold text-text-muted bg-surface-background border border-surface-border rounded-md shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-surface-border custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-text-muted font-medium">
              No matching commands or navigation routes found.
            </div>
          ) : (
            filtered.map((cmd, idx) => (
              <div
                key={cmd.id}
                onClick={() => handleSelect(cmd)}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors text-xs font-semibold ${
                  selectedIndex === idx ? 'bg-primary/10 text-primary' : 'hover:bg-surface-hover text-text-primary'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-surface-background border border-surface-border shrink-0">
                    {cmd.icon}
                  </div>
                  <div>
                    <p className="font-bold">{cmd.title}</p>
                    <p className="text-[10px] text-text-muted font-normal uppercase tracking-wider">{cmd.category}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-text-muted" />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-surface-background border-t border-surface-border flex items-center justify-between text-[11px] text-text-muted font-medium">
          <span>
            Use <kbd className="px-1.5 py-0.5 bg-white border rounded font-bold">↑</kbd>{' '}
            <kbd className="px-1.5 py-0.5 bg-white border rounded font-bold">↓</kbd> to navigate
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-white border rounded font-bold">↵</kbd> to select
          </span>
        </div>
      </div>
    </div>
  );
}
