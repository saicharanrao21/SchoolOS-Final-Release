'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Bell,
  Mail,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  Radio,
  Users
} from 'lucide-react';

export default function CommunicationsDashboard() {
  const stats = [
    { label: 'Messages Sent (This Month)', value: '14,250', change: 'Multi-channel', icon: Send, color: 'bg-blue-600' },
    { label: 'Delivery Success Rate', value: '98.4%', change: 'High Reliability', icon: CheckCircle2, color: 'bg-green-600' },
    { label: 'Active Campaigns', value: '3', change: 'Broadcasts', icon: Radio, color: 'bg-purple-600' },
    { label: 'Delivery Failures', value: '12', change: 'Invalid Numbers', icon: AlertCircle, color: 'bg-amber-600' },
  ];

  const recentCampaigns = [
    { id: 'c1', title: 'Emergency Weather Closing', channel: 'SMS, WhatsApp, Push', audience: 'All School', sent: '1,240', status: 'COMPLETED', date: '2026-09-02' },
    { id: 'c2', title: 'Q1 Fee Due Reminder', channel: 'Email, In-App', audience: 'Parents', sent: '450', status: 'PROCESSING', date: '2026-09-03' },
    { id: 'c3', title: 'Annual Day Registration Open', channel: 'In-App, Push', audience: 'Students, Parents', sent: '890', status: 'COMPLETED', date: '2026-08-28' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Enterprise Communications</h1>
          <p className="text-text-secondary text-sm">Multi-channel messaging, broadcast campaigns, and delivery tracking</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Broadcast Campaign
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-card shadow-card border border-surface-border transition-all hover:border-primary/20">
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.color} p-3 rounded-xl text-white shadow-lg shadow-current/10`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest bg-surface-background px-2 py-0.5 rounded border border-surface-border">
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">{stat.label}</p>
              <p className="text-3xl font-bold text-text-primary mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Channel Performance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-card shadow-card border border-surface-border p-6">
          <h3 className="font-bold text-text-primary text-lg mb-6 flex items-center gap-2">
            <Radio className="w-5 h-5 text-primary" />
            Active Broadcast Campaigns
          </h3>
          <div className="space-y-4">
            {recentCampaigns.map((c) => (
              <div key={c.id} className="p-4 rounded-xl border border-surface-border bg-surface-background flex items-center justify-between hover:border-primary/30 transition-all">
                <div>
                  <p className="font-bold text-sm text-text-primary">{c.title}</p>
                  <p className="text-xs text-text-muted mt-1">Channels: {c.channel} • Target: {c.audience}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                    c.status === 'COMPLETED' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-blue-50 border-blue-200 text-blue-700'
                  }`}>
                    {c.status}
                  </span>
                  <p className="text-[10px] text-text-muted mt-1 font-bold">{c.sent} messages</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-card shadow-card border border-surface-border p-6">
          <h3 className="font-bold text-text-primary text-lg mb-6 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-600" />
            Channel Breakdown
          </h3>
          <div className="space-y-5">
            {[
              { channel: 'In-App Notifications', count: '6,420', percent: '45%' },
              { channel: 'Push Notifications', count: '4,180', percent: '29%' },
              { channel: 'WhatsApp Messages', count: '2,150', percent: '15%' },
              { channel: 'Transactional SMS', count: '1,500', percent: '11%' },
            ].map((ch) => (
              <div key={ch.channel} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-text-primary">
                  <span>{ch.channel}</span>
                  <span className="text-text-muted">{ch.count} ({ch.percent})</span>
                </div>
                <div className="w-full h-2 bg-surface-background rounded-full overflow-hidden border border-surface-border">
                  <div className="h-full bg-primary rounded-full" style={{ width: ch.percent }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
