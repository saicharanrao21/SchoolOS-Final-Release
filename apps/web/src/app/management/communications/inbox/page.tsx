'use client';

import { useMemo, useState } from 'react';
import { MessageSquare, Search, Users, Archive, Send } from 'lucide-react';

type Thread = { id: string; subject: string; status: string; lastMessageAt?: string; messages?: { body: string; createdAt: string }[] };

export default function CommunicationsInboxPage() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const threads: Thread[] = [];
  const filtered = useMemo(() => threads.filter(t => t.subject.toLowerCase().includes(query.toLowerCase())), [query]);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Communication Inbox</h1>
        <p className="text-sm text-text-secondary">Two-way school, parent, teacher and student conversations with audited tenant isolation.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="bg-white border border-surface-border rounded-card shadow-card">
          <div className="p-4 border-b border-surface-border flex gap-2">
            <Search className="w-4 h-4 mt-2 text-text-muted" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search conversations" className="flex-1 outline-none text-sm" />
          </div>
          <div className="divide-y divide-surface-border">
            {filtered.length ? filtered.map(t => (
              <button key={t.id} onClick={() => setSelected(t.id)} className="w-full text-left p-4 hover:bg-surface-background">
                <div className="flex justify-between gap-3"><span className="font-bold text-sm">{t.subject}</span><span className="text-[10px] uppercase font-bold">{t.status}</span></div>
                <p className="text-xs text-text-muted mt-1">{t.messages?.[0]?.body || 'No messages yet'}</p>
              </button>
            )) : <div className="p-8 text-center text-sm text-text-muted"><MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-40" />No conversations loaded yet.</div>}
          </div>
        </section>
        <section className="lg:col-span-2 bg-white border border-surface-border rounded-card shadow-card min-h-[520px]">
          {selected ? <div className="h-full flex flex-col"><div className="p-5 border-b border-surface-border flex justify-between"><div><h2 className="font-bold">Conversation</h2><p className="text-xs text-text-muted">Thread {selected}</p></div><button className="text-text-muted hover:text-text-primary"><Archive className="w-4 h-4" /></button></div><div className="flex-1 p-6" /><div className="p-4 border-t border-surface-border flex gap-2"><input placeholder="Write a message..." className="flex-1 border border-surface-border rounded-lg px-3 py-2 text-sm" /><button className="bg-primary text-white rounded-lg px-4"><Send className="w-4 h-4" /></button></div></div> : <div className="h-full min-h-[520px] flex items-center justify-center text-center text-text-muted"><div><Users className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="font-semibold">Select a conversation</p><p className="text-xs mt-1">Parent and staff messages will appear here.</p></div></div>}
        </section>
      </div>
    </div>
  );
}
