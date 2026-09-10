import React from 'react';
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function ApplicationsPage() {
  const applications = [
    { id: '1', appNo: 'APP-GA260045', name: 'Alice Smith', class: 'Grade 5', campus: 'Main Campus', date: 'Aug 25, 2026', status: 'UNDER_REVIEW' },
    { id: '2', appNo: 'APP-GA260046', name: 'Robert Brown', class: 'Grade 1', campus: 'Main Campus', date: 'Aug 24, 2026', status: 'DOCUMENTS_PENDING' },
    { id: '3', appNo: 'APP-GA260047', name: 'Emily Davis', class: 'Grade 10', campus: 'North Campus', date: 'Aug 24, 2026', status: 'APPROVED' },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-600 border-green-200';
      case 'DOCUMENTS_PENDING': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'UNDER_REVIEW': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'REJECTED': return 'bg-red-100 text-red-600 border-red-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Admission Applications</h1>
          <p className="text-text-secondary">Process student admissions and verification workflows</p>
        </div>
        <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Application
        </button>
      </div>

      <div className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
        <div className="p-4 border-b border-surface-border flex items-center justify-between gap-4">
          <div className="flex-1 max-w-sm relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by ID or name..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-2 border border-surface-border rounded-lg text-sm font-medium bg-white text-text-secondary outline-none">
              <option>All Statuses</option>
              <option>Under Review</option>
              <option>Approved</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-background text-text-muted text-[10px] font-bold uppercase tracking-widest border-b border-surface-border">
              <tr>
                <th className="px-6 py-4">Application</th>
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Grade/Campus</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-sm">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <code className="text-xs font-bold text-primary bg-primary-light px-2 py-1 rounded">{app.appNo}</code>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-text-primary">{app.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-text-primary">{app.class}</p>
                    <p className="text-[10px] text-text-muted uppercase font-bold">{app.campus}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${getStatusStyle(app.status)}`}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-muted">
                    {app.date}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Link href={`/management/admissions/applications/${app.id}`}>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-primary hover:bg-primary-light transition-all">
                          Process
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                      <button className="p-2 hover:bg-surface-background rounded-full text-text-muted transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
