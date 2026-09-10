'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  Receipt,
  FileCheck,
  Clock,
  Plus,
  CheckCircle2,
  AlertCircle,
  Building,
  Filter,
  Download
} from 'lucide-react';

export default function InternalFinancePage() {
  const [filter, setFilter] = useState('ALL');

  const stats = [
    { label: 'Total Claims (This Month)', value: '28', change: '$14,250.00 Total', icon: Receipt, color: 'bg-blue-600' },
    { label: 'Pending Approvals', value: '5', change: 'Action Required', icon: Clock, color: 'bg-amber-600' },
    { label: 'Approved Claims', value: '18', change: 'Ready for Payment', icon: FileCheck, color: 'bg-indigo-600' },
    { label: 'Reimbursements Paid', value: '$9,820.00', change: 'Settled', icon: CheckCircle2, color: 'bg-green-600' },
  ];

  const expenses = [
    { id: 'exp-1', claimNumber: 'EXP-2026-000001', title: 'AWS Cloud Infrastructure Invoice', category: 'IT & Hosting', amount: '$3,420.00', submittedBy: 'Sarah Jenkins', date: '2026-09-01', status: 'PAID' },
    { id: 'exp-2', claimNumber: 'EXP-2026-000002', title: 'SchoolOS Regional Summit Travel', category: 'Travel & Events', amount: '$1,250.00', submittedBy: 'Michael Chang', date: '2026-09-02', status: 'APPROVED' },
    { id: 'exp-3', claimNumber: 'EXP-2026-000003', title: 'Legal Counsel Retainer - Q3', category: 'Legal & Professional', amount: '$2,500.00', submittedBy: 'Alex Ross', date: '2026-09-03', status: 'SUBMITTED' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Internal Operations Finance</h1>
          <p className="text-text-secondary text-sm">Platform company expense claims, reimbursements, vendor payments, and operational budgets</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Submit Expense Claim
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

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-surface-border pb-2">
        {['ALL', 'SUBMITTED', 'APPROVED', 'PAID'].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${
              filter === st
                ? 'bg-primary text-white shadow'
                : 'text-text-muted hover:bg-surface-background'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Expense Claims Table */}
      <div className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-background border-b border-surface-border text-xs uppercase text-text-muted font-bold">
            <tr>
              <th className="p-4">Claim #</th>
              <th className="p-4">Title</th>
              <th className="p-4">Category</th>
              <th className="p-4">Submitted By</th>
              <th className="p-4">Date</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {expenses
              .filter((e) => filter === 'ALL' || e.status === filter)
              .map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-xs font-mono text-primary">{exp.claimNumber}</td>
                  <td className="p-4 font-bold text-text-primary">{exp.title}</td>
                  <td className="p-4 text-xs font-semibold text-text-muted">{exp.category}</td>
                  <td className="p-4 text-text-secondary text-xs">{exp.submittedBy}</td>
                  <td className="p-4 text-text-muted text-xs">{exp.date}</td>
                  <td className="p-4 font-bold text-text-primary">{exp.amount}</td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                        exp.status === 'PAID'
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : exp.status === 'APPROVED'
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-amber-50 border-amber-200 text-amber-700'
                      }`}
                    >
                      {exp.status}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
