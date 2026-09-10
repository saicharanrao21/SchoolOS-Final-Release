'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CalendarDays, CheckCircle2, RefreshCw, TrendingDown, Users } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

function authHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function AttendanceIntelligencePage() {
  const [summary, setSummary] = useState<any>(null);
  const [risk, setRisk] = useState<any[]>([]);
  const [schoolId, setSchoolId] = useState('');
  const [academicYearId, setAcademicYearId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    if (!schoolId || !academicYearId) return;
    setLoading(true); setError('');
    try {
      const [s, r] = await Promise.all([
        fetch(`${API}/attendance/records/school/${schoolId}/daily-summary`, { headers: authHeaders() }),
        fetch(`${API}/attendance/records/school/${schoolId}/at-risk?academicYearId=${encodeURIComponent(academicYearId)}`, { headers: authHeaders() }),
      ]);
      if (!s.ok || !r.ok) throw new Error('Unable to load attendance intelligence');
      setSummary(await s.json()); setRisk(await r.json());
    } catch (e: any) { setError(e?.message || 'Unable to load attendance intelligence'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [schoolId, academicYearId]);
  const highRisk = useMemo(() => risk.filter((r) => r.risk === 'HIGH').length, [risk]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-text-primary">Attendance Intelligence</h1><p className="text-text-secondary">Daily presence, attendance trends and at-risk students</p></div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 rounded-button border border-surface-border bg-white text-sm font-bold"><RefreshCw className="w-4 h-4" />Refresh</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input value={schoolId} onChange={(e) => setSchoolId(e.target.value)} placeholder="School ID" className="rounded-lg border border-surface-border px-4 py-3 text-sm" />
        <input value={academicYearId} onChange={(e) => setAcademicYearId(e.target.value)} placeholder="Academic Year ID" className="rounded-lg border border-surface-border px-4 py-3 text-sm" />
      </div>
      {error && <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}
      {loading && <div className="p-6 bg-white rounded-card border border-surface-border">Loading attendance intelligence…</div>}
      {summary && !loading && <>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            ['Attendance Rate', `${summary.attendanceRate}%`, TrendingDown],
            ['Records', summary.totals.total || 0, Users],
            ['Absent', summary.totals.ABSENT || 0, AlertTriangle],
            ['High Risk', highRisk, CheckCircle2],
          ].map(([label, value, Icon]: any) => <div key={label as string} className="bg-white rounded-card border border-surface-border p-5"><Icon className="w-5 h-5 text-primary mb-3" /><p className="text-xs uppercase tracking-widest font-bold text-text-muted">{label}</p><p className="text-2xl font-bold mt-1 text-text-primary">{value}</p></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-card border border-surface-border overflow-hidden"><div className="p-5 border-b border-surface-border"><h2 className="font-bold">Today by Class / Section</h2></div><div className="divide-y divide-surface-border">{summary.sessions.map((s: any) => <div key={s.sessionId} className="p-4 flex items-center justify-between"><div><p className="font-bold">{s.className || 'School'}{s.sectionName ? ` · ${s.sectionName}` : ''}</p><p className="text-xs text-text-muted mt-1">{s.type} · {s.status}</p></div><div className="text-right text-xs"><span className="font-bold">{s.present} present</span><span className="ml-3 text-orange-600">{s.late} late</span><span className="ml-3 text-red-600">{s.absent} absent</span></div></div>)}</div></div>
          <div className="bg-white rounded-card border border-surface-border overflow-hidden"><div className="p-5 border-b border-surface-border"><h2 className="font-bold">Students Requiring Attention</h2></div><div className="divide-y divide-surface-border">{risk.length === 0 ? <div className="p-6 text-sm text-text-muted">No students currently meet the risk criteria.</div> : risk.slice(0, 20).map((r) => <div key={r.id} className="p-4 flex items-center justify-between"><div><p className="font-bold">{r.firstName} {r.lastName}</p><p className="text-xs text-text-muted">{r.admissionNumber} · {r.consecutiveAbsences} consecutive absences</p></div><div className="text-right"><p className={`font-bold ${r.risk === 'HIGH' ? 'text-red-600' : 'text-orange-600'}`}>{r.attendancePercentage}%</p><p className="text-[10px] uppercase tracking-widest text-text-muted">{r.risk}</p></div></div>)}</div></div>
        </div>
      </>}
      {!summary && !loading && <div className="bg-white rounded-card border border-surface-border p-10 text-center"><CalendarDays className="w-8 h-8 mx-auto mb-3 text-text-muted" /><p className="font-bold">Select a school and academic year</p><p className="text-sm text-text-muted mt-1">The dashboard will load live attendance data from the SchoolOS API.</p></div>}
    </div>
  );
}
