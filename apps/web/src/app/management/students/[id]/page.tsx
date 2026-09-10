'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  User,
  Shield,
  BookOpen,
  FileText,
  History,
  MapPin,
  Phone,
  Mail,
  Edit2,
  MoreVertical,
  Printer
} from 'lucide-react';
import Link from 'next/link';

export default function StudentProfilePage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'academic', label: 'Academic', icon: BookOpen },
    { id: 'guardians', label: 'Guardians', icon: Shield },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/management/students" className="p-2 hover:bg-white rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-text-muted" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Alice Johnson</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-text-muted uppercase tracking-widest">GA260001</span>
              <span className="w-1 h-1 rounded-full bg-text-muted/30"></span>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase">Active Student</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-surface-border rounded-lg text-sm font-bold text-text-secondary hover:bg-white transition-all shadow-sm">
            <Printer className="w-4 h-4" />
            <span>ID Card</span>
          </button>
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-button font-bold transition-all shadow-md active:scale-95">
            <Edit2 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
          <button className="p-2.5 border border-surface-border rounded-lg hover:bg-white text-text-muted transition-all">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-card shadow-card border border-surface-border p-8 flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-3xl bg-primary-light flex items-center justify-center text-primary text-4xl font-bold mb-6 border-4 border-white shadow-xl shadow-primary/10">
              AJ
            </div>
            <h2 className="text-xl font-bold text-text-primary">Alice Johnson</h2>
            <p className="text-sm text-text-muted font-medium mb-6">Grade 10 • Section A</p>

            <div className="w-full space-y-4 pt-6 border-t border-surface-border">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-text-secondary">+44 7700 900077</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-text-secondary">alice.j@global.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-text-secondary text-left">24 Abbey Road, London, NW8 9AY</span>
              </div>
            </div>
          </div>

          <div className="bg-sidebar-background rounded-card p-6 text-white shadow-xl shadow-sidebar-background/20 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500">
              <Shield className="w-32 h-32" />
            </div>
            <h3 className="font-bold text-sm uppercase tracking-widest opacity-60 mb-4">Primary Guardian</h3>
            <p className="text-lg font-bold">Robert Johnson</p>
            <p className="text-sm opacity-80 mt-1">Father • Software Engineer</p>
            <button className="mt-6 w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-all backdrop-blur-sm">View Contact</button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
            <div className="flex border-b border-surface-border bg-surface-background/30 p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-white shadow-sm text-primary'
                      : 'text-text-muted hover:bg-white/50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-8">
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Admission Date</p>
                      <p className="text-sm font-bold text-text-primary">August 15, 2026</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Current Session</p>
                      <p className="text-sm font-bold text-text-primary">2026-27</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Roll Number</p>
                      <p className="text-sm font-bold text-text-primary">10-A-01</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">House</p>
                      <p className="text-sm font-bold text-red-600">Red House</p>
                    </div>
                  </div>

                  <div className="p-6 bg-surface-background rounded-2xl border border-surface-border">
                    <h4 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      Emergency Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-text-muted">Blood Group</p>
                        <p className="font-bold text-text-primary">O Positive (O+)</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted">Allergies</p>
                        <p className="font-bold text-yellow-600 italic">None Reported</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab !== 'overview' && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40">
                   <div className="w-16 h-16 bg-surface-background rounded-full flex items-center justify-center">
                     <History className="w-8 h-8 text-text-muted" />
                   </div>
                   <div>
                     <p className="font-bold text-text-primary uppercase tracking-widest text-xs">Module Implementation Required</p>
                     <p className="text-xs text-text-muted mt-1">This section will be populated in subsequent phases.</p>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
