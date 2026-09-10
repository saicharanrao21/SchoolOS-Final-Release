'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  User,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  MessageSquare,
  Shield,
  Briefcase,
  History,
  MoreVertical,
  Check,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function ApplicationProfilePage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('overview');

  const application = {
    id: params.id,
    appNo: 'APP-GA260045',
    name: 'Alice Smith',
    class: 'Grade 5',
    campus: 'Main Campus',
    status: 'UNDER_REVIEW',
    phone: '+1 234 567 8901',
    email: 'alice.smith@gmail.com',
    dob: 'May 12, 2016',
    guardian: 'Robert Smith',
    source: 'Website'
  };

  const timeline = [
    { title: 'Application Submitted', date: 'Aug 25, 2026', actor: 'System', status: 'completed' },
    { title: 'Documents Uploaded', date: 'Aug 26, 2026', actor: 'Parent', status: 'completed' },
    { title: 'Under Review', date: 'Aug 27, 2026', actor: 'Counsellor', status: 'current' },
    { title: 'Interview', date: 'TBD', actor: '-', status: 'pending' },
    { title: 'Decision', date: 'TBD', actor: '-', status: 'pending' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/management/admissions/applications" className="p-2 hover:bg-white rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-text-muted" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{application.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-text-muted uppercase tracking-widest">{application.appNo}</span>
              <span className="w-1 h-1 rounded-full bg-text-muted/30"></span>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase border border-blue-100">Under Review</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-4 py-2 border border-surface-border rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 transition-all">
             <XCircle className="w-4 h-4" />
             Reject
           </button>
           <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-button font-bold text-sm shadow-md transition-all active:scale-95">
             <Check className="w-4 h-4" />
             Approve Admission
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
            <div className="flex border-b border-surface-border bg-surface-background/30 p-1">
              {['overview', 'documents', 'assessment', 'guardian'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                    activeTab === tab
                      ? 'bg-white shadow-sm text-primary'
                      : 'text-text-muted hover:bg-white/50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-8">
               {activeTab === 'overview' && (
                 <div className="space-y-10">
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Date of Birth</p>
                        <p className="text-sm font-bold text-text-primary">{application.dob}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Requested Grade</p>
                        <p className="text-sm font-bold text-text-primary">{application.class}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Preferred Campus</p>
                        <p className="text-sm font-bold text-text-primary">{application.campus}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Lead Source</p>
                        <p className="text-sm font-bold text-text-primary">{application.source}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Contact Phone</p>
                        <p className="text-sm font-bold text-text-primary">{application.phone}</p>
                      </div>
                   </div>

                   <div className="p-6 bg-surface-background rounded-2xl border border-surface-border">
                     <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                       <MessageSquare className="w-4 h-4 text-primary" />
                       Internal Notes
                     </h3>
                     <p className="text-sm text-text-secondary italic">"Applicant seems highly motivated. Previous school reports are excellent in mathematics and sports."</p>
                   </div>
                 </div>
               )}

               {activeTab === 'documents' && (
                 <div className="space-y-4">
                   {['Birth Certificate', 'Previous Year Report Card', 'Identity Proof'].map((doc, idx) => (
                     <div key={doc} className="flex items-center justify-between p-4 rounded-xl border border-surface-border bg-white hover:border-primary/20 transition-all">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-lg bg-surface-background flex items-center justify-center text-text-muted">
                           <FileText className="w-5 h-5" />
                         </div>
                         <div>
                           <p className="text-sm font-bold text-text-primary">{doc}</p>
                           <p className="text-[10px] font-bold text-green-600 uppercase">Verified</p>
                         </div>
                       </div>
                       <button className="text-xs font-bold text-primary hover:underline">View File</button>
                     </div>
                   ))}
                 </div>
               )}

               {activeTab !== 'overview' && activeTab !== 'documents' && (
                 <div className="py-20 text-center opacity-30">
                    <History className="w-12 h-12 mx-auto mb-4" />
                    <p className="font-bold uppercase tracking-widest text-xs">Section Under Construction</p>
                 </div>
               )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-card shadow-card border border-surface-border p-8">
            <h3 className="text-lg font-bold text-text-primary mb-6">Workflow Status</h3>
            <div className="space-y-8">
              {timeline.map((step, i) => (
                <div key={step.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                      step.status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                      step.status === 'current' ? 'bg-white border-primary text-primary' :
                      'bg-white border-surface-border text-text-muted'
                    }`}>
                      {step.status === 'completed' ? <Check className="w-3.5 h-3.5 font-bold" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                    </div>
                    {i < timeline.length - 1 && <div className={`w-0.5 h-8 ${step.status === 'completed' ? 'bg-green-500' : 'bg-surface-border'}`}></div>}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${step.status === 'current' ? 'text-primary' : 'text-text-primary'}`}>{step.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">{step.date} • {step.actor}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary rounded-card p-8 text-white shadow-xl shadow-primary/20">
            <Shield className="w-10 h-10 mb-4 opacity-50" />
            <h4 className="text-sm font-bold uppercase tracking-widest opacity-70 mb-1">Counsellor</h4>
            <p className="text-lg font-bold">Sarah Connor</p>
            <p className="text-xs opacity-70 mt-4">Assigned 2 days ago</p>
          </div>
        </div>
      </div>
    </div>
  );
}
