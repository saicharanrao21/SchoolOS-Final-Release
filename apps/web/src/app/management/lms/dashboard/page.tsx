'use client';

import { useCallback, useEffect, useState } from 'react';
import { BookOpen, CheckCircle2, ClipboardList, GraduationCap, Radio, RefreshCw, Users } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
const authHeaders = () => ({ Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : ''}` });

type Stats = { courses:number; publishedCourses:number; activeEnrollments:number; completedEnrollments:number; upcomingLiveClasses:number; quizzes:number };

export default function LmsDashboardPage() {
  const [schoolId, setSchoolId] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true); setError('');
    try {
      const [a, b] = await Promise.all([
        fetch(`${API}/lms/dashboard?schoolId=${encodeURIComponent(schoolId)}`, { headers: authHeaders() }),
        fetch(`${API}/lms/courses?schoolId=${encodeURIComponent(schoolId)}`, { headers: authHeaders() }),
      ]);
      if (!a.ok || !b.ok) throw new Error('Unable to load digital learning data');
      setStats(await a.json()); setCourses(await b.json());
    } catch (e:any) { setError(e?.message || 'Unable to load LMS'); }
    finally { setLoading(false); }
  }, [schoolId]);
  useEffect(() => { load(); }, [load]);

  return <div className="space-y-7 animate-in fade-in duration-500">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-primary mb-2"><GraduationCap className="w-4 h-4"/> Digital Classroom</div><h1 className="text-3xl font-black text-text-primary">Learning Management System</h1><p className="text-sm text-text-secondary mt-1 max-w-2xl">Courses, structured lessons, resources, live teaching, learner progress and online assessments in one school learning hub.</p></div>
      <button onClick={load} disabled={!schoolId || loading} className="inline-flex items-center gap-2 rounded-button border border-surface-border bg-white px-4 py-2.5 text-sm font-bold"><RefreshCw className={`w-4 h-4 ${loading?'animate-spin':''}`}/> Refresh</button>
    </div>
    <div className="rounded-card border border-surface-border bg-white p-5 shadow-card"><label className="text-xs font-bold uppercase tracking-wider text-text-muted">School ID</label><div className="mt-2 flex gap-3"><input value={schoolId} onChange={e=>setSchoolId(e.target.value)} placeholder="Enter school ID" className="w-full max-w-md rounded-xl border border-surface-border px-4 py-2.5 text-sm outline-none focus:border-primary"/><button onClick={load} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white">Load</button></div></div>
    {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      <Metric icon={BookOpen} label="Courses" value={stats?.courses ?? '—'} />
      <Metric icon={CheckCircle2} label="Published Courses" value={stats?.publishedCourses ?? '—'} />
      <Metric icon={Users} label="Active Enrollments" value={stats?.activeEnrollments ?? '—'} />
      <Metric icon={GraduationCap} label="Completed Enrollments" value={stats?.completedEnrollments ?? '—'} />
      <Metric icon={Radio} label="Upcoming Live Classes" value={stats?.upcomingLiveClasses ?? '—'} />
      <Metric icon={ClipboardList} label="Quizzes" value={stats?.quizzes ?? '—'} />
    </div>
    <div className="rounded-card border border-surface-border bg-white shadow-card overflow-hidden"><div className="px-6 py-5 border-b border-surface-border"><h2 className="font-bold text-text-primary">Course Catalogue</h2><p className="text-xs text-text-muted mt-1">Structured learning spaces available to this school.</p></div>{!schoolId ? <Empty text="Enter a school ID to load courses."/> : courses.length===0 ? <Empty text="No courses created yet."/> : <div className="divide-y divide-surface-border">{courses.map(c=><div key={c.id} className="px-6 py-5 flex flex-wrap items-center justify-between gap-4"><div><div className="flex items-center gap-2"><h3 className="font-bold text-text-primary">{c.title}</h3><span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-extrabold uppercase text-primary">{c.status}</span></div><p className="text-xs text-text-muted mt-1">{c.code || 'No code'} · {c.subject?.name || 'General subject'} · {c.class?.name || 'All classes'}</p></div><div className="flex gap-5 text-xs font-bold text-text-secondary"><span>{c._count?.modules ?? 0} modules</span><span>{c._count?.enrollments ?? 0} learners</span><span>{c._count?.quizzes ?? 0} quizzes</span></div></div>)}</div>}</div>
  </div>;
}
function Metric({icon:Icon,label,value}:{icon:any;label:string;value:any}){return <div className="rounded-card border border-surface-border bg-white p-6 shadow-card"><Icon className="h-5 w-5 text-primary"/><p className="mt-4 text-xs font-bold uppercase tracking-wider text-text-muted">{label}</p><p className="mt-1 text-3xl font-black text-text-primary">{value}</p></div>}
function Empty({text}:{text:string}){return <div className="px-6 py-12 text-center text-sm text-text-muted">{text}</div>}
