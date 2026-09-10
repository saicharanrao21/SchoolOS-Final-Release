'use client';

import React, { useState } from 'react';
import { ArrowLeft, Save, User, MapPin, Shield, GraduationCap, FileText } from 'lucide-react';
import Link from 'next/link';

export default function NewStudentPage() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { label: 'Personal', icon: User },
    { label: 'Guardian', icon: Shield },
    { label: 'Address', icon: MapPin },
    { label: 'Enrollment', icon: GraduationCap },
    { label: 'Documents', icon: FileText },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/management/students" className="p-2 hover:bg-white rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-text-muted" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">New Student Admission</h1>
          <p className="text-text-secondary text-sm">Register a new student into the system</p>
        </div>
      </div>

      <div className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
        <div className="flex border-b border-surface-border bg-surface-background/50">
          {steps.map((step, i) => (
            <button
              key={step.label}
              onClick={() => setActiveStep(i)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-2 text-xs font-bold uppercase tracking-widest transition-all ${
                activeStep === i
                  ? 'bg-white border-b-2 border-primary text-primary'
                  : 'text-text-muted hover:bg-white/50'
              }`}
            >
              <step.icon className={`w-4 h-4 ${activeStep === i ? 'text-primary' : 'text-text-muted'}`} />
              <span className="hidden sm:inline">{step.label}</span>
            </button>
          ))}
        </div>

        <div className="p-10 space-y-8">
          {activeStep === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">First Name</label>
                <input type="text" className="w-full px-4 py-3 rounded-lg border border-surface-border focus:ring-2 focus:ring-primary/20 outline-none text-sm" placeholder="e.g. John" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">Last Name</label>
                <input type="text" className="w-full px-4 py-3 rounded-lg border border-surface-border focus:ring-2 focus:ring-primary/20 outline-none text-sm" placeholder="e.g. Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">Date of Birth</label>
                <input type="date" className="w-full px-4 py-3 rounded-lg border border-surface-border focus:ring-2 focus:ring-primary/20 outline-none text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">Gender</label>
                <select className="w-full px-4 py-3 rounded-lg border border-surface-border focus:ring-2 focus:ring-primary/20 outline-none text-sm">
                  <option>Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          )}

          <div className="pt-8 border-t border-surface-border flex justify-between">
            <button
              disabled={activeStep === 0}
              onClick={() => setActiveStep(prev => prev - 1)}
              className="px-6 py-2.5 rounded-button font-bold text-text-secondary hover:bg-surface-background disabled:opacity-30 transition-all"
            >
              Previous
            </button>

            {activeStep === steps.length - 1 ? (
              <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded-button font-bold transition-all shadow-md active:scale-95">
                <Save className="w-4 h-4" />
                <span>Complete Admission</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveStep(prev => prev + 1)}
                className="bg-primary hover:bg-primary-dark text-white px-8 py-2.5 rounded-button font-bold transition-all shadow-md active:scale-95"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
