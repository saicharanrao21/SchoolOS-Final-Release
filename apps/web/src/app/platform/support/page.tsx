'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Clock3, ShieldCheck, UserRoundCheck, XCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function PlatformSupportPage() {
  const [organizationId, setOrganizationId] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [reason, setReason] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [token, setToken] = useState('');
  const [sessions, setSessions] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  const authHeaders = () => ({
    Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : ''}`,
    'Content-Type': 'application/json',
  });

  const loadSessions = async () => {
    try {
      const response = await fetch(`${API_URL}/platform/support-sessions/active`, { headers: authHeaders() });
      if (response.ok) setSessions(await response.json());
    } catch {
      // The page remains usable while the API is unavailable during local UI development.
    }
  };

  useEffect(() => { void loadSessions(); }, []);

  const createSession = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    setToken('');
    try {
      const response = await fetch(`${API_URL}/platform/support-sessions`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ organizationId, targetUserId, reason, durationMinutes }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || 'Unable to create support session');
        return;
      }
      setToken(data.supportToken);
      setMessage(`Session created for ${data.targetUser?.email || 'target user'}.`);
      setReason('');
      await loadSessions();
    } catch {
      setMessage('Unable to reach the SchoolOS API.');
    }
  };

  const endSession = async (id: string) => {
    const response = await fetch(`${API_URL}/platform/support-sessions/${id}/end`, {
      method: 'POST', headers: authHeaders(),
    });
    if (response.ok) await loadSessions();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-3 text-primary"><ShieldCheck className="h-6 w-6" /></div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">School Support & Impersonation</h1>
            <p className="text-sm text-text-secondary">Controlled, time-bound support access without sharing school credentials.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
        <form onSubmit={createSession} className="space-y-5 rounded-card border border-surface-border bg-white p-6 shadow-card">
          <h2 className="text-lg font-bold">Start Support Session</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">Tenant / Organization ID
              <input value={organizationId} onChange={e => setOrganizationId(e.target.value)} required className="mt-2 w-full rounded-lg border p-3 font-normal" placeholder="org_xxx" />
            </label>
            <label className="text-sm font-semibold">Target User ID
              <input value={targetUserId} onChange={e => setTargetUserId(e.target.value)} required className="mt-2 w-full rounded-lg border p-3 font-normal" placeholder="user_xxx" />
            </label>
          </div>
          <label className="text-sm font-semibold">Support reason
            <textarea value={reason} onChange={e => setReason(e.target.value)} required minLength={5} className="mt-2 min-h-28 w-full rounded-lg border p-3 font-normal" placeholder="Explain the customer issue being investigated" />
          </label>
          <label className="text-sm font-semibold">Session duration
            <select value={durationMinutes} onChange={e => setDurationMinutes(Number(e.target.value))} className="mt-2 w-full rounded-lg border p-3 font-normal">
              <option value={15}>15 minutes</option><option value={30}>30 minutes</option><option value={60}>60 minutes</option><option value={120}>120 minutes</option>
            </select>
          </label>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Every session is audited. The token is short-lived, scoped to one tenant and target user, and can be revoked.</div>
          <button className="flex items-center gap-2 rounded-button bg-primary px-5 py-3 text-sm font-bold text-white"><UserRoundCheck className="h-4 w-4" />Create Secure Session</button>
          {message && <p className="text-sm font-semibold text-text-secondary">{message}</p>}
        </form>

        <div className="rounded-card border border-surface-border bg-white p-6 shadow-card">
          <h2 className="mb-4 text-lg font-bold">One-Time Support Token</h2>
          {token ? <>
            <p className="mb-3 text-sm text-text-secondary">Exchange this token in the support client for a target-user access token. It is never persisted in plaintext.</p>
            <div className="break-all rounded-lg bg-slate-950 p-4 font-mono text-xs text-white">{token}</div>
            <button type="button" onClick={() => navigator.clipboard?.writeText(token)} className="mt-4 rounded-lg border px-4 py-2 text-sm font-bold">Copy Token</button>
          </> : <div className="flex min-h-48 items-center justify-center text-center text-sm text-text-muted">Create a support session to receive a one-time token.</div>}
        </div>
      </div>

      <div className="overflow-hidden rounded-card border border-surface-border bg-white shadow-card">
        <div className="flex items-center justify-between border-b p-6"><h2 className="text-lg font-bold">My Active Support Sessions</h2><Clock3 className="h-5 w-5 text-text-muted" /></div>
        {sessions.length === 0 ? <p className="p-6 text-sm text-text-muted">No active support sessions.</p> : <div className="divide-y">{sessions.map(s => <div key={s.id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div><p className="font-bold">{s.targetUser?.firstName} {s.targetUser?.lastName}</p><p className="text-xs text-text-muted">{s.organization?.name} · {s.targetUser?.email}</p><p className="mt-1 text-xs">Expires {new Date(s.expiresAt).toLocaleString()}</p></div><button type="button" onClick={() => endSession(s.id)} className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700"><XCircle className="h-4 w-4" />End Session</button></div>)}</div>}
      </div>
    </div>
  );
}
