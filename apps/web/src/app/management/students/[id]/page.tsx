'use client';

import React, { useState } from 'react';
import { PageHeader } from '../../../../components/common/PageHeader';
import { Card } from '../../../../components/common/Card';
import { StatusBadge } from '../../../../components/common/StatusBadge';
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
  CheckCircle2,
  Wallet,
  Calendar,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

export default function Student360ProfilePage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'academic' | 'guardians' | 'documents' | 'notes'>('overview');

  const mockStudent = {
    id: params.id,
    admissionNumber: 'ADM-2026-0001',
    firstName: 'Alice',
    lastName: 'Johnson',
    displayName: 'Alice Johnson',
    dateOfBirth: '2010-05-14',
    gender: 'Female',
    nationality: 'American',
    status: 'ACTIVE',
    schoolName: 'SchoolOS Main Campus',
    campusName: 'Main Campus',
    className: 'Grade 10',
    sectionName: 'A',
    rollNumber: '10-A-01',
    houseName: 'Red Dragons',
    guardians: [
      { name: 'Robert Johnson', relationship: 'FATHER', isPrimary: true, phone: '+1 415 987 6543', email: 'robert.j@schoolos.test' },
      { name: 'Martha Johnson', relationship: 'MOTHER', isPrimary: false, phone: '+1 415 987 6544', email: 'martha.j@schoolos.test' },
    ],
    enrollmentHistory: [
      { academicYear: '2026-2027', school: 'SchoolOS Main Campus', class: 'Grade 10', section: 'A', status: 'ACTIVE' },
      { academicYear: '2025-2026', school: 'SchoolOS Main Campus', class: 'Grade 9', section: 'B', status: 'COMPLETED' },
    ],
    documents: [
      { name: 'Birth Certificate', type: 'BIRTH_CERTIFICATE', status: 'VERIFIED' },
      { name: 'Previous Grade Transcript', type: 'ACADEMIC_RECORD', status: 'VERIFIED' },
    ],
    notes: [
      { category: 'ACADEMIC', content: 'Excelled in District Science Olympiad competition.', author: 'Dr. Sarah Connor', date: '2026-09-01' },
    ],
    attendanceRate: 98,
    feeBalance: 0,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title={`${mockStudent.displayName} (${mockStudent.admissionNumber})`}
        subtitle={`${mockStudent.className} • Section ${mockStudent.sectionName} • ${mockStudent.schoolName}`}
        badge={mockStudent.status}
        badgeVariant="SUCCESS"
        breadcrumbs={[
          { label: 'SchoolOS', href: '/management/dashboard' },
          { label: 'Students', href: '/management/students' },
          { label: mockStudent.displayName },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Profile Card */}
        <div className="space-y-6">
          <Card className="text-center p-6">
            <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-2xl mx-auto mb-4">
              AJ
            </div>
            <h2 className="font-bold text-text-primary text-lg">{mockStudent.displayName}</h2>
            <p className="text-xs font-semibold text-text-muted mt-0.5">
              {mockStudent.className} • Section {mockStudent.sectionName} (Roll: {mockStudent.rollNumber})
            </p>

            <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-surface-border text-center">
              <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                <p className="text-[10px] font-bold text-green-700 uppercase">Attendance</p>
                <p className="text-lg font-bold text-green-800">{mockStudent.attendanceRate}%</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-[10px] font-bold text-blue-700 uppercase">Fee Balance</p>
                <p className="text-lg font-bold text-blue-900">${mockStudent.feeBalance}</p>
              </div>
            </div>
          </Card>

          {/* Primary Guardian Summary */}
          <Card title="Primary Guardian" subtitle="Direct contact & portal access authorization">
            <div className="space-y-3 text-xs font-medium text-text-secondary">
              <p className="font-bold text-text-primary text-sm">{mockStudent.guardians[0].name}</p>
              <p className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-primary" /> Relationship: {mockStudent.guardians[0].relationship}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-text-muted" /> {mockStudent.guardians[0].phone}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-text-muted" /> {mockStudent.guardians[0].email}
              </p>
            </div>
          </Card>
        </div>

        {/* Right Column: Student 360 Tabbed Workspace */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex border-b border-surface-border bg-white rounded-2xl p-1.5 shadow-sm text-xs font-bold gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'academic', label: 'Academic & History', icon: BookOpen },
              { id: 'guardians', label: 'Guardians', icon: Shield },
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'notes', label: 'Notes & Activity', icon: History },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                  activeTab === tab.id ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <Card title="Personal & Demographic Information">
              <div className="grid grid-cols-2 gap-4 text-xs font-medium text-text-secondary">
                <div>
                  <p className="text-[10px] font-bold uppercase text-text-muted">Date of Birth</p>
                  <p className="font-bold text-text-primary mt-0.5">{mockStudent.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-text-muted">Gender</p>
                  <p className="font-bold text-text-primary mt-0.5">{mockStudent.gender}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-text-muted">Nationality</p>
                  <p className="font-bold text-text-primary mt-0.5">{mockStudent.nationality}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-text-muted">House Group</p>
                  <p className="font-bold text-primary mt-0.5">{mockStudent.houseName}</p>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'academic' && (
            <Card title="Academic Enrollment History" subtitle="Traceable class placement history across sessions">
              <div className="divide-y divide-surface-border">
                {mockStudent.enrollmentHistory.map((h, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-text-primary">{h.academicYear} • {h.class} - {h.section}</p>
                      <p className="text-text-muted">{h.school}</p>
                    </div>
                    <StatusBadge status={h.status} />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'guardians' && (
            <Card title="Linked Family & Guardian Relationships">
              <div className="divide-y divide-surface-border">
                {mockStudent.guardians.map((g, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-text-primary">{g.name} ({g.relationship})</p>
                      <p className="text-text-muted">{g.phone} • {g.email}</p>
                    </div>
                    {g.isPrimary && <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold text-[10px] rounded-full border border-blue-200">PRIMARY</span>}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'documents' && (
            <Card title="Student Document Archive">
              <div className="divide-y divide-surface-border">
                {mockStudent.documents.map((d, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <div>
                        <p className="font-bold text-text-primary">{d.name}</p>
                        <p className="text-[10px] text-text-muted uppercase">{d.type}</p>
                      </div>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'notes' && (
            <Card title="Student Activity & Categorized Notes">
              <div className="space-y-3">
                {mockStudent.notes.map((n, idx) => (
                  <div key={idx} className="p-3 bg-surface-background rounded-xl border border-surface-border text-xs space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase text-text-muted">
                      <span>{n.category} • {n.author}</span>
                      <span>{n.date}</span>
                    </div>
                    <p className="text-text-primary font-medium">{n.content}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
