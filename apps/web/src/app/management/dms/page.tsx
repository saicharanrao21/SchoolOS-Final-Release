import React from 'react';
import {
  FileText,
  Upload,
  ShieldCheck,
  Clock,
  AlertCircle,
  Search,
  Filter,
  MoreVertical,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  FileSearch,
  Activity
} from 'lucide-react';

export default function DocumentCenter() {
  const stats = [
    { label: 'Total Documents', value: '4,284', change: '+124 today', icon: FileText, color: 'bg-blue-600' },
    { label: 'Pending Verification', value: '18', change: '5 high priority', icon: Clock, color: 'bg-orange-500' },
    { label: 'Expiring Soon', value: '12', change: 'Within 30 days', icon: AlertCircle, color: 'bg-red-500' },
    { label: 'Verified Assets', value: '98%', change: 'Compliance rate', icon: ShieldCheck, color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Document Management</h1>
          <p className="text-text-secondary text-sm">Centralized vault for institutional records, identity, and compliance</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-white border border-surface-border text-text-primary px-4 py-2.5 rounded-button font-bold text-sm hover:bg-surface-background transition-all flex items-center gap-2">
             <Filter className="w-4 h-4" />
             Filters
           </button>
           <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
             <Upload className="w-4 h-4" />
             Upload Document
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-card shadow-card border border-surface-border">
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.color} p-3 rounded-xl text-white shadow-lg shadow-current/10`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">{stat.label}</p>
              <p className="text-2xl font-bold text-text-primary mt-1">{stat.value}</p>
              <p className="text-[10px] text-green-600 font-bold mt-1 uppercase tracking-wider">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
        <div className="p-6 border-b border-surface-border flex items-center justify-between">
          <h3 className="font-bold text-text-primary">Recent Uploads</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type="text" placeholder="Search documents..." className="pl-10 pr-4 py-2 bg-surface-background border border-surface-border rounded-button text-xs focus:outline-none focus:border-primary w-64" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-background text-[10px] font-bold text-text-muted uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Document Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Verification</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {[
                { title: 'Birth Certificate', cat: 'IDENTITY', owner: 'Alice Johnson', status: 'ACTIVE', ver: 'VERIFIED', date: '2m ago' },
                { title: 'Employment Contract', cat: 'EMPLOYMENT', owner: 'Robert Smith', status: 'ACTIVE', ver: 'PENDING', date: '15m ago' },
                { title: 'Vehicle Insurance', cat: 'TRANSPORT', owner: 'Bus #04', status: 'EXPIRING', ver: 'VERIFIED', date: '1h ago' },
                { title: 'Academic Transcript', cat: 'ACADEMIC', owner: 'Mark Davis', status: 'ACTIVE', ver: 'UNDER REVIEW', date: '3h ago' },
              ].map((doc, i) => (
                <tr key={i} className="hover:bg-blue-50/10 transition-colors group">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-text-primary">{doc.title}</p>
                      <p className="text-[10px] text-text-muted">{doc.date}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold bg-surface-background px-2 py-1 rounded border border-surface-border">
                      {doc.cat}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-text-secondary">{doc.owner}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold ${doc.status === 'EXPIRING' ? 'text-red-600' : 'text-text-primary'}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       {doc.ver === 'VERIFIED' ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <Clock className="w-3 h-3 text-orange-500" />}
                       <span className="text-xs font-medium text-text-primary">{doc.ver}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="p-1.5 hover:bg-surface-background rounded text-text-muted hover:text-primary"><Eye className="w-4 h-4" /></button>
                       <button className="p-1.5 hover:bg-surface-background rounded text-text-muted hover:text-primary"><Download className="w-4 h-4" /></button>
                       <button className="p-1.5 hover:bg-surface-background rounded text-text-muted hover:text-primary"><MoreVertical className="w-4 h-4" /></button>
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
