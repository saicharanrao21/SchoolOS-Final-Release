'use client';

import React, { useState } from 'react';
import { Bell, X, CheckCheck, AlertCircle, Wallet, Calendar, Shield, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface NotificationCenterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenterDrawer({ isOpen, onClose }: NotificationCenterDrawerProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ALL' | 'URGENT' | 'APPROVALS' | 'FINANCE'>('ALL');

  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Fee Payment Received',
      body: 'Receipt RCP-2026-00412 generated for $450 against invoice INV-1002.',
      category: 'FINANCE',
      isUrgent: false,
      isRead: false,
      time: '10m ago',
      href: '/management/finance/collection',
    },
    {
      id: 'notif-2',
      title: 'Purchase Order Approval Required',
      body: 'PO-2026-089 for Science Lab Consumables awaits principal review.',
      category: 'APPROVALS',
      isUrgent: true,
      isRead: false,
      time: '25m ago',
      href: '/management/workflow/inbox',
    },
    {
      id: 'notif-3',
      title: 'Biometric Punch Exception',
      body: '3 unmapped biometric punches detected at Gate 2.',
      category: 'URGENT',
      isUrgent: true,
      isRead: false,
      time: '1h ago',
      href: '/management/security/dashboard',
    },
  ]);

  if (!isOpen) return null;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const filtered = notifications.filter((n) => {
    if (activeTab === 'URGENT') return n.isUrgent;
    if (activeTab === 'APPROVALS') return n.category === 'APPROVALS';
    if (activeTab === 'FINANCE') return n.category === 'FINANCE';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-surface-border flex flex-col animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-6 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-base text-text-primary">Notifications</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
            <button onClick={onClose} className="p-1 text-text-muted hover:text-text-primary rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-surface-border px-4 bg-surface-background/50 text-xs font-semibold">
          {(['ALL', 'URGENT', 'APPROVALS', 'FINANCE'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-3 border-b-2 transition-all ${
                activeTab === tab ? 'border-primary text-primary font-bold' : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-text-muted">No notifications in this category.</div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.href) router.push(item.href);
                  onClose();
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  item.isRead ? 'bg-white border-surface-border' : 'bg-blue-50/40 border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-bold text-xs text-text-primary">{item.title}</span>
                  <span className="text-[10px] text-text-muted shrink-0">{item.time}</span>
                </div>
                <p className="text-xs text-text-secondary leading-normal mb-2">{item.body}</p>
                <div className="flex items-center justify-between text-[10px] font-bold text-primary">
                  <span className="uppercase tracking-wider text-text-muted">{item.category}</span>
                  <span className="inline-flex items-center gap-1 hover:underline">
                    View <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
