'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw, ShieldAlert, Siren } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

function headers() {
  return { Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : ''}` };
}

export default function TransportSafetyPage() {
  const [schoolId, setSchoolId] = useState('');
  const [summary, setSummary] = useState({ open: 0, critical: 0, today: 0 });
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true); setError('');
    try {
      const [summaryResponse, incidentsResponse] = await Promise.all([
        fetch(`${API}/transport/tracking/incidents/summary?schoolId=${encodeURIComponent(schoolId)}`, { headers: headers() }),
        fetch(`${API}/transport/tracking/incidents/list?schoolId=${encodeURIComponent(schoolId)}&status=OPEN`, { headers: headers() }),
      ]);
      if (!summaryResponse.ok || !incidentsResponse.ok) throw new Error('Unable to load transport safety data');
      setSummary(await summaryResponse.json());
      setIncidents(await incidentsResponse.json());
    } catch (e: any) { setError(e?.message || 'Unable to load safety data'); }
    finally { setLoading(false); }
  }, [schoolId]);

  useEffect(() => { load(); }, [load]);

  async function resolve(id: string) {
    const resolution = window.prompt('Resolution / action taken (optional):') || '';
    const response = await fetch(`${API}/transport/tracking/incidents/${id}/resolve`, {
      method: 'POST', headers: { ...headers(), 'Content-Type': 'application/json' }, body: JSON.stringify({ resolution }),
    });
    if (!response.ok) { setError('Unable to resolve incident'); return; }
    await load();
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Transport Safety & Incident Control</h1>
          <p className="text-sm text-text-secondary mt-1">Route deviation, speeding and emergency incidents detected from live trip telemetry.</p>
        </div>
        <button onClick={load} disabled={loading || !schoolId} className="inline-flex items-center gap-2 rounded-button border border-surface-border bg-white px-4 py-2.5 text-sm font-bold">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="rounded-card border border-surface-border bg-white p-5 shadow-card">
        <label className="text-xs font-bold uppercase tracking-wider text-text-muted">School ID</label>
        <div className="mt-2 flex gap-3">
          <input value={schoolId} onChange={e => setSchoolId(e.target.value)} placeholder="Select / enter school ID" className="w-full max-w-md rounded-xl border border-surface-border px-4 py-2.5 text-sm outline-none focus:border-primary" />
          <button onClick={load} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white">Load</button>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

      <div className="grid gap-5 md:grid-cols-3">
        <Metric icon={ShieldAlert} label="Open Incidents" value={summary.open} />
        <Metric icon={Siren} label="Critical Open" value={summary.critical} />
        <Metric icon={AlertTriangle} label="Incidents Today" value={summary.today} />
      </div>

      <div className="rounded-card border border-surface-border bg-white shadow-card overflow-hidden">
        <div className="border-b border-surface-border px-6 py-4"><h2 className="font-bold text-text-primary">Open Safety Incidents</h2></div>
        {!schoolId ? <Empty text="Enter a school ID to inspect live safety incidents." /> : incidents.length === 0 ? <Empty text="No open transport safety incidents." /> : (
          <div className="divide-y divide-surface-border">
            {incidents.map((incident) => (
              <div key={incident.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-red-50 p-3 text-red-600"><AlertTriangle className="h-5 w-5" /></div>
                  <div>
                    <div className="flex items-center gap-2"><p className="font-bold text-text-primary">{incident.type.replaceAll('_', ' ')}</p><span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase text-orange-700">{incident.severity}</span></div>
                    <p className="mt-1 text-sm text-text-secondary">{incident.description || 'No description recorded.'}</p>
                    <p className="mt-2 text-xs text-text-muted">Trip: {incident.trip?.id || '—'} · Vehicle: {incident.trip?.vehicle?.vehicleNumber || '—'} · {new Date(incident.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <button onClick={() => resolve(incident.id)} className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50"><CheckCircle2 className="h-4 w-4" /> Resolve</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: any) {
  return <div className="rounded-card border border-surface-border bg-white p-6 shadow-card"><Icon className="h-5 w-5 text-primary" /><p className="mt-4 text-xs font-bold uppercase tracking-wider text-text-muted">{label}</p><p className="mt-1 text-3xl font-bold text-text-primary">{value}</p></div>;
}
function Empty({ text }: { text: string }) { return <div className="px-6 py-12 text-center text-sm text-text-muted">{text}</div>; }
