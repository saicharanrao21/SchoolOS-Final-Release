import React from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  Filter,
  FileText,
  CheckCircle2,
  XCircle,
  MoreVertical,
  QrCode,
  Download,
  Settings2,
  Users
} from 'lucide-react';

export default function CertificateCenter() {
  const stats = [
    { label: 'Issued (Total)', value: '12,842', change: '+240 this year', icon: FileText, color: 'bg-indigo-600' },
    { label: 'Active Templates', value: '14', change: '8 Academic', icon: Settings2, color: 'bg-blue-600' },
    { label: 'Digital Verifications', value: '842', change: 'Last 30 days', icon: QrCode, color: 'bg-green-500' },
    { label: 'Revoked', value: '2', change: 'Security actions', icon: XCircle, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Certificate Issuance</h1>
          <p className="text-text-secondary text-sm">Design, issue, and verify institutional credentials</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-white border border-surface-border text-text-primary px-4 py-2.5 rounded-button font-bold text-sm hover:bg-surface-background transition-all">
             Template Designer
           </button>
           <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
             <Plus className="w-4 h-4" />
             Issue Certificate
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
              <p className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-wider">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
            <div className="p-6 border-b border-surface-border flex items-center justify-between">
               <h3 className="font-bold text-text-primary">Recent Issuance</h3>
               <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                    <input type="text" placeholder="Search by number..." className="pl-9 pr-4 py-1.5 bg-surface-background border border-surface-border rounded-button text-xs focus:outline-none focus:border-primary w-48" />
                  </div>
                  <button className="p-2 hover:bg-surface-background rounded-button border border-surface-border transition-colors">
                    <Filter className="w-4 h-4 text-text-muted" />
                  </button>
               </div>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-surface-background text-[10px] font-bold text-text-muted uppercase tracking-widest">
                     <tr>
                        <th className="px-6 py-4">Cert Number</th>
                        <th className="px-6 py-4">Template</th>
                        <th className="px-6 py-4">Recipient</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                     {[
                       { id: 'CERT-2026-00142', template: 'Study Certificate', recipient: 'Alice Johnson', date: 'Sept 01, 2026' },
                       { id: 'CERT-2026-00143', template: 'Transfer Certificate', recipient: 'Robert Smith', date: 'Aug 28, 2026' },
                       { id: 'CERT-2026-00144', template: 'Character Certificate', recipient: 'Mark Davis', date: 'Aug 25, 2026' },
                       { id: 'CERT-2026-00145', template: 'Bonafide Certificate', recipient: 'Sarah Wilson', date: 'Aug 20, 2026' },
                     ].map((cert, i) => (
                       <tr key={i} className="hover:bg-blue-50/10 transition-colors group">
                          <td className="px-6 py-4 text-sm font-bold text-primary">{cert.id}</td>
                          <td className="px-6 py-4 text-sm font-medium text-text-primary">{cert.template}</td>
                          <td className="px-6 py-4 text-sm text-text-secondary">{cert.recipient}</td>
                          <td className="px-6 py-4 text-xs text-text-muted">{cert.date}</td>
                          <td className="px-6 py-4 text-right">
                             <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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

         <div className="space-y-6">
            <div className="bg-white rounded-card shadow-card border border-surface-border p-6">
               <h3 className="font-bold text-text-primary mb-6">Popular Templates</h3>
               <div className="space-y-4">
                  {[
                    { name: 'Study Certificate', count: 482, color: 'bg-blue-500' },
                    { name: 'Transfer Certificate', count: 124, color: 'bg-indigo-500' },
                    { name: 'Bonafide Certificate', count: 340, color: 'bg-teal-500' },
                  ].map((tpl, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-background/50 border border-surface-border">
                       <div>
                          <p className="text-sm font-bold text-text-primary">{tpl.name}</p>
                          <p className="text-[10px] text-text-muted font-bold">{tpl.count} issued</p>
                       </div>
                       <div className={`w-2 h-2 rounded-full ${tpl.color}`}></div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-primary rounded-card shadow-card p-6 text-white overflow-hidden relative group">
               <div className="absolute top-0 right-0 p-8 -mr-4 -mt-4 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
               <h3 className="font-bold mb-2 flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  Quick Verification
               </h3>
               <p className="text-white/70 text-xs mb-6">Verify any institutional certificate by number or digital token.</p>
               <input type="text" placeholder="Enter Certificate Number" className="w-full bg-white/20 border border-white/30 rounded-button px-4 py-2 text-sm placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all mb-4" />
               <button className="w-full bg-white text-primary font-bold py-2.5 rounded-button text-sm active:scale-95 transition-all shadow-lg">
                  Verify Now
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
