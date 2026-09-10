import React from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  MapPin,
  Route,
  Clock,
  Navigation,
  CheckCircle2,
  Users
} from 'lucide-react';

export default function RoutesPage() {
  const routes = [
    { id: '1', code: 'RT-01', name: 'North City Express', direction: 'BOTH', stops: 12, students: 42, status: 'PUBLISHED' },
    { id: '2', code: 'RT-02', name: 'West Suburb Loop', direction: 'PICKUP', stops: 8, students: 28, status: 'PUBLISHED' },
    { id: '3', code: 'RT-03', name: 'South High Street', direction: 'BOTH', stops: 15, students: 35, status: 'DRAFT' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Transport Routes</h1>
          <p className="text-text-secondary text-sm">Define and manage institutional transit paths and stops</p>
        </div>
        <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Route
        </button>
      </div>

      <div className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
        <div className="p-4 border-b border-surface-border flex items-center justify-between gap-4 bg-surface-background/20">
          <div className="flex-1 max-w-sm relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by route name or code..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-border focus:ring-2 focus:ring-primary/20 outline-none text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button className="p-2 border border-surface-border rounded-lg bg-white text-text-muted hover:text-primary transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-background text-text-muted text-[10px] font-bold uppercase tracking-widest border-b border-surface-border">
              <tr>
                <th className="px-8 py-4">Route Info</th>
                <th className="px-8 py-4">Direction</th>
                <th className="px-8 py-4 text-center">Stops</th>
                <th className="px-8 py-4 text-center">Students</th>
                <th className="px-8 py-4 text-center">Status</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {routes.map((r) => (
                <tr key={r.id} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                       <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center text-primary">
                          <Route className="w-5 h-5" />
                       </div>
                       <div className="flex flex-col">
                          <span className="font-bold text-text-primary">{r.name}</span>
                          <span className="text-[10px] font-mono font-bold text-text-muted">{r.code}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-text-secondary flex items-center gap-1.5 uppercase">
                       <Navigation className="w-3.5 h-3.5 rotate-45" />
                       {r.direction}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="px-2 py-1 bg-surface-background border rounded text-xs font-bold text-text-primary">
                      {r.stops} Stops
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex items-center justify-center gap-1 text-sm font-bold text-text-primary">
                       <Users className="w-4 h-4 text-text-muted" />
                       {r.students}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                      r.status === 'PUBLISHED' ? 'bg-green-100 text-green-600 border-green-200' : 'bg-yellow-100 text-yellow-600 border-yellow-200'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                       <button className="p-2 hover:bg-primary-light rounded-lg text-primary transition-colors">
                          <ChevronRight className="w-4 h-4" />
                       </button>
                       <button className="p-2 hover:bg-surface-background rounded-full text-text-muted">
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
