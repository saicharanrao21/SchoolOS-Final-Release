'use client';

import { useState } from 'react';
import { PageHeader } from '../../../../components/common/PageHeader';
import { Card } from '../../../../components/common/Card';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { FilterBar } from '../../../../components/common/FilterBar';
import { MessageSquare, Users, Send, Radio } from 'lucide-react';

export default function CommunicationsInboxPage() {
  const [search, setSearch] = useState('');
  const [selectedThread, setSelectedThread] = useState<string | null>('1');

  const mockThreads = [
    { id: '1', sender: 'Robert Johnson (Parent)', subject: 'Academic Progress Inquiry for Alice', time: '10m ago', status: 'ACTIVE', preview: 'Hello, I wanted to inquire regarding the upcoming Science Olympiad preparation...' },
    { id: '2', sender: 'Dr. Sarah Connor (Principal)', subject: 'Staff Meeting Notice', time: '1h ago', status: 'CLOSED', preview: 'Reminder regarding the monthly academic coordination meeting tomorrow morning...' },
  ];

  const filtered = mockThreads.filter((t) =>
    `${t.sender} ${t.subject} ${t.preview}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Communication Inbox & Two-Way Portal Threads"
        subtitle="Audited two-way communication between school staff, parents, and students"
        badge="Multi-Channel Portal"
        badgeVariant="SUCCESS"
        breadcrumbs={[
          { label: 'SchoolOS', href: '/management/dashboard' },
          { label: 'Communications' },
          { label: 'Inbox' },
        ]}
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter sender or subject..."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Active Conversations">
          <div className="divide-y divide-surface-border text-xs">
            {filtered.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedThread(t.id)}
                className={`p-3 rounded-xl cursor-pointer transition-colors space-y-1 ${
                  selectedThread === t.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-surface-hover'
                }`}
              >
                <div className="flex justify-between items-center font-bold">
                  <span className="text-text-primary">{t.sender}</span>
                  <span className="text-[10px] text-text-muted">{t.time}</span>
                </div>
                <p className="font-semibold text-text-primary truncate">{t.subject}</p>
                <p className="text-text-muted text-[11px] truncate">{t.preview}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Conversation View" className="lg:col-span-2">
          {selectedThread ? (
            <div className="space-y-4 text-xs font-medium">
              <div className="p-3 bg-surface-background rounded-xl border border-surface-border space-y-1">
                <p className="font-bold text-text-primary text-sm">Academic Progress Inquiry for Alice</p>
                <p className="text-text-muted">From: Robert Johnson (Parent) • Sent via Parent Portal</p>
              </div>

              <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-2xl space-y-2">
                <p className="font-bold text-blue-900 text-xs">Robert Johnson (Parent):</p>
                <p className="text-blue-950 text-xs leading-relaxed">
                  Hello, I wanted to inquire regarding the upcoming Science Olympiad preparation schedule and material required for Alice Johnson.
                </p>
              </div>

              <div className="pt-4 border-t border-surface-border flex gap-2">
                <input
                  type="text"
                  placeholder="Type your response to guardian..."
                  className="flex-1 bg-surface-background border border-surface-border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-sm shrink-0">
                  <Send className="w-3.5 h-3.5" /> Send Reply
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-text-muted text-xs">Select a conversation to view message history.</div>
          )}
        </Card>
      </div>
    </div>
  );
}
