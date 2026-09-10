'use client';

import { useState, useEffect, createContext, useContext } from 'react';

export interface WorkspaceContextState {
  organizationId: string | null;
  schoolId: string | null;
  campusId: string | null;
  academicYearId: string | null;
  organizationName: string;
  schoolName: string;
  campusName: string;
  academicYearName: string;
}

const STORAGE_KEY = 'schoolos_workspace_context_v1';

export const DEFAULT_WORKSPACE_CONTEXT: WorkspaceContextState = {
  organizationId: 'org-default',
  schoolId: 'school-default',
  campusId: 'campus-default',
  academicYearId: 'year-2026-2027',
  organizationName: 'Global Education Trust',
  schoolName: 'SchoolOS Main Campus',
  campusName: 'Main Campus',
  academicYearName: '2026-2027 Academic Session',
};

export function getStoredWorkspaceContext(): WorkspaceContextState {
  if (typeof window === 'undefined') return DEFAULT_WORKSPACE_CONTEXT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_WORKSPACE_CONTEXT;
    return { ...DEFAULT_WORKSPACE_CONTEXT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_WORKSPACE_CONTEXT;
  }
}

export function saveStoredWorkspaceContext(ctx: WorkspaceContextState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ctx));
  } catch (e) {
    console.error('Failed to save workspace context', e);
  }
}

export interface WorkspaceContextValue {
  context: WorkspaceContextState;
  setContext: (updater: (prev: WorkspaceContextState) => WorkspaceContextState) => void;
  switchSchool: (schoolId: string, name: string) => void;
  switchAcademicYear: (yearId: string, name: string) => void;
}

export const WorkspaceContext = createContext<WorkspaceContextValue>({
  context: DEFAULT_WORKSPACE_CONTEXT,
  setContext: () => {},
  switchSchool: () => {},
  switchAcademicYear: () => {},
});

export function useWorkspaceContext() {
  return useContext(WorkspaceContext);
}
