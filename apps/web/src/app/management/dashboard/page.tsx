import React from 'react';
import { Users, School, MapPin, ShieldCheck } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    { label: 'Total Organizations', value: '12', icon: ShieldCheck, color: 'bg-blue-500' },
    { label: 'Total Schools', value: '48', icon: School, color: 'bg-purple-500' },
    { label: 'Total Campuses', value: '86', icon: MapPin, color: 'bg-indigo-500' },
    { label: 'Total Users', value: '1,240', icon: Users, color: 'bg-blue-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">System Overview</h1>
        <p className="text-text-secondary">Identity and multi-tenancy dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-card shadow-card border border-surface-border flex items-center gap-4 transition-transform hover:scale-[1.02]">
            <div className={`${stat.color} p-3 rounded-xl text-white`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">{stat.label}</p>
              <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-card shadow-card border border-surface-border">
          <h3 className="text-lg font-bold text-text-primary mb-4">Recent Audit Logs</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-surface-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-background flex items-center justify-center">
                    <Users className="w-4 h-4 text-text-muted" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">User Created: John Doe</p>
                    <p className="text-xs text-text-muted">Actor: System Admin</p>
                  </div>
                </div>
                <span className="text-xs text-text-muted">2 mins ago</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-card shadow-card border border-surface-border">
          <h3 className="text-lg font-bold text-text-primary mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text-secondary">API Service</span>
              <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-600 rounded-full">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text-secondary">Database</span>
              <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-600 rounded-full">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text-secondary">Redis Cache</span>
              <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-600 rounded-full">Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
