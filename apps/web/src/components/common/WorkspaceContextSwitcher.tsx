'use client';

import React, { useState } from 'react';
import { Building2, School, Calendar, ChevronDown, Check } from 'lucide-react';
import { useWorkspaceContext } from '../../lib/stores/workspace-context';

export function WorkspaceContextSwitcher() {
  const { context, switchSchool, switchAcademicYear } = useWorkspaceContext();
  const [openDropdown, setOpenDropdown] = useState<'SCHOOL' | 'YEAR' | null>(null);

  const mockSchools = [
    { id: 'school-default', name: 'SchoolOS Main Campus', code: 'MAIN' },
    { id: 'school-north', name: 'SchoolOS North Branch', code: 'NORTH' },
    { id: 'school-south', name: 'SchoolOS South Campus', code: 'SOUTH' },
  ];

  const mockYears = [
    { id: 'year-2026-2027', name: '2026-2027 Academic Session' },
    { id: 'year-2025-2026', name: '2025-2026 Academic Session' },
  ];

  return (
    <div className="flex items-center gap-2 text-xs">
      {/* School Switcher */}
      <div className="relative">
        <button
          onClick={() => setOpenDropdown(openDropdown === 'SCHOOL' ? null : 'SCHOOL')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-surface-border bg-white text-text-primary hover:bg-surface-hover transition-all shadow-sm font-semibold"
          title="Switch Active School"
        >
          <School className="w-3.5 h-3.5 text-primary" />
          <span className="truncate max-w-[140px]">{context.schoolName}</span>
          <ChevronDown className="w-3 h-3 text-text-muted" />
        </button>

        {openDropdown === 'SCHOOL' && (
          <div className="absolute top-full left-0 mt-1.5 w-60 bg-white border border-surface-border rounded-xl shadow-lg z-50 p-1 divide-y divide-surface-border animate-in fade-in duration-200">
            <div className="p-2 text-[10px] font-bold uppercase tracking-wider text-text-muted">Select School / Campus</div>
            <div className="py-1">
              {mockSchools.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    switchSchool(s.id, s.name);
                    setOpenDropdown(null);
                  }}
                  className="flex items-center justify-between w-full px-3 py-2 text-left rounded-lg text-xs hover:bg-surface-hover font-medium text-text-primary transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-text-muted" />
                    <span>{s.name}</span>
                  </div>
                  {context.schoolId === s.id && <Check className="w-3.5 h-3.5 text-primary font-bold" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Session Switcher */}
      <div className="relative hidden md:block">
        <button
          onClick={() => setOpenDropdown(openDropdown === 'YEAR' ? null : 'YEAR')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-surface-border bg-white text-text-secondary hover:bg-surface-hover transition-all shadow-sm font-medium"
          title="Switch Active Session"
        >
          <Calendar className="w-3.5 h-3.5 text-text-muted" />
          <span>{context.academicYearName}</span>
          <ChevronDown className="w-3 h-3 text-text-muted" />
        </button>

        {openDropdown === 'YEAR' && (
          <div className="absolute top-full left-0 mt-1.5 w-56 bg-white border border-surface-border rounded-xl shadow-lg z-50 p-1 divide-y divide-surface-border animate-in fade-in duration-200">
            <div className="p-2 text-[10px] font-bold uppercase tracking-wider text-text-muted">Academic Session</div>
            <div className="py-1">
              {mockYears.map((y) => (
                <button
                  key={y.id}
                  onClick={() => {
                    switchAcademicYear(y.id, y.name);
                    setOpenDropdown(null);
                  }}
                  className="flex items-center justify-between w-full px-3 py-2 text-left rounded-lg text-xs hover:bg-surface-hover font-medium text-text-primary transition-colors"
                >
                  <span>{y.name}</span>
                  {context.academicYearId === y.id && <Check className="w-3.5 h-3.5 text-primary font-bold" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
