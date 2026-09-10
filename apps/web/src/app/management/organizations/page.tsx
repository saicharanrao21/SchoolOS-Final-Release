import React from 'react';
import { Plus, Search, Filter, MoreVertical } from 'lucide-react';

export default function OrganizationsPage() {
  const orgs = [
    { name: 'Global Academy Group', slug: 'global-academy', schools: 12, status: 'Active', createdAt: '2026-08-15' },
    { name: 'Heritage Educational Trust', slug: 'heritage-trust', schools: 8, status: 'Active', createdAt: '2026-08-20' },
    { name: 'Modern Schooling Corp', slug: 'modern-schooling', schools: 5, status: 'Active', createdAt: '2026-08-25' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Organizations</h1>
          <p className="text-text-secondary">Manage platform-level enterprise accounts</p>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-button font-bold transition-all shadow-md active:scale-95">
          <Plus className="w-5 h-5" />
          <span>New Organization</span>
        </button>
      </div>

      <div className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
        <div className="p-4 border-b border-surface-border flex items-center justify-between gap-4">
          <div className="flex-1 max-w-sm relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search organizations..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-surface-border rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-background transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>

        <table className="w-full text-left">
          <thead className="bg-surface-background text-text-muted text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Organization Name</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4 text-center">Schools</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Created Date</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {orgs.map((org) => (
              <tr key={org.slug} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-bold text-text-primary">{org.name}</span>
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">{org.slug}</td>
                <td className="px-6 py-4 text-center font-semibold text-text-primary">{org.schools}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 text-xs font-bold bg-green-100 text-green-600 rounded-full">{org.status}</span>
                </td>
                <td className="px-6 py-4 text-sm text-text-muted">{org.createdAt}</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-surface-background rounded-full text-text-muted transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-4 bg-surface-background flex items-center justify-between">
          <span className="text-sm text-text-muted">Showing 1 to 3 of 12 organizations</span>
          <div className="flex gap-2">
            <button disabled className="px-4 py-2 rounded-lg border border-surface-border text-sm font-medium bg-white text-text-muted disabled:opacity-50">Previous</button>
            <button className="px-4 py-2 rounded-lg border border-surface-border text-sm font-medium bg-white text-text-primary hover:bg-surface-background">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
