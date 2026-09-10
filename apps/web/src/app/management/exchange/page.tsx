import React from 'react';
import {
  RefreshCcw,
  Upload,
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Database,
  ArrowRight,
  Plus,
  Search,
  Activity
} from 'lucide-react';

export default function DataExchange() {
  const stats = [
    { label: 'Import Jobs (Today)', value: '12', change: '8 completed', icon: Upload, color: 'bg-blue-600' },
    { label: 'Export Requests', value: '42', change: '5 processing', icon: Download, color: 'bg-green-500' },
    { label: 'Avg Validation Time', value: '2.4s', change: 'Real-time engine', icon: Activity, color: 'bg-orange-500' },
    { label: 'Storage Used', value: '8.4 GB', change: '15% of limit', icon: Database, color: 'bg-indigo-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Data Exchange</h1>
          <p className="text-text-secondary text-sm">Bulk import data or export institutional records for reporting</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-white border border-surface-border text-text-primary px-4 py-2.5 rounded-button font-bold text-sm hover:bg-surface-background transition-all flex items-center gap-2">
             <Clock className="w-4 h-4" />
             Job History
           </button>
           <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
             <Plus className="w-4 h-4" />
             New Import
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
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white rounded-card shadow-card border border-surface-border p-8">
            <h3 className="text-lg font-bold text-text-primary mb-8 flex items-center gap-2">
               <Upload className="w-5 h-5 text-blue-600" />
               Recent Imports
            </h3>
            <div className="space-y-4">
               {[
                 { template: 'Student Master', rows: 842, status: 'COMPLETED', time: '10m ago' },
                 { template: 'Employee Directory', rows: 142, status: 'COMPLETED', time: '1h ago' },
                 { template: 'Library Catalog', rows: 4800, status: 'PROCESSING', time: 'Just now' },
                 { template: 'Fee Defaulters', rows: 24, status: 'FAILED', time: '2h ago' },
               ].map((job, i) => (
                 <div key={i} className="flex items-center justify-between p-4 border border-surface-border rounded-xl">
                    <div>
                       <p className="text-sm font-bold text-text-primary">{job.template}</p>
                       <p className="text-[10px] text-text-muted font-bold">{job.rows} records • {job.time}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                      job.status === 'COMPLETED' ? 'text-green-600 bg-green-50' :
                      job.status === 'PROCESSING' ? 'text-blue-600 bg-blue-50 animate-pulse' : 'text-red-600 bg-red-50'
                    }`}>
                      {job.status}
                    </span>
                 </div>
               ))}
            </div>
         </div>

         <div className="bg-white rounded-card shadow-card border border-surface-border p-8">
            <h3 className="text-lg font-bold text-text-primary mb-8 flex items-center gap-2">
               <Download className="w-5 h-5 text-green-600" />
               Recent Exports
            </h3>
            <div className="space-y-4">
               {[
                 { entity: 'Monthly Attendance', format: 'XLSX', status: 'AVAILABLE', time: '5m ago' },
                 { entity: 'Class 10 Results', format: 'PDF', status: 'AVAILABLE', time: '30m ago' },
                 { entity: 'Staff Payroll Register', format: 'CSV', status: 'EXPIRED', time: '2d ago' },
                 { entity: 'Library Inventory', format: 'XLSX', status: 'AVAILABLE', time: '1d ago' },
               ].map((job, i) => (
                 <div key={i} className="flex items-center justify-between p-4 border border-surface-border rounded-xl group">
                    <div>
                       <p className="text-sm font-bold text-text-primary">{job.entity}</p>
                       <p className="text-[10px] text-text-muted font-bold uppercase">{job.format} • {job.time}</p>
                    </div>
                    <div className="flex gap-2">
                       {job.status === 'AVAILABLE' && (
                         <button className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                         </button>
                       )}
                       <span className={`text-[10px] font-bold px-2 py-1 rounded self-center ${
                         job.status === 'AVAILABLE' ? 'text-green-600 bg-green-50' : 'text-text-muted bg-surface-background'
                       }`}>
                         {job.status}
                       </span>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
