import React from 'react';
import {
  ShoppingCart,
  FileText,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  BarChart3,
  Plus,
  ArrowRight
} from 'lucide-react';

export default function ProcurementDashboard() {
  const stats = [
    { label: 'Pending Requests', value: '14', change: '8 high priority', icon: Clock, color: 'bg-orange-500' },
    { label: 'Active POs', value: '28', change: '₹12.4L total value', icon: FileText, color: 'bg-blue-600' },
    { label: 'Pending Receipts', value: '6', change: 'Due today: 2', icon: ShoppingCart, color: 'bg-indigo-600' },
    { label: 'Active Vendors', value: '42', change: '84% rated GOOD', icon: Users, color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Procurement Control</h1>
          <p className="text-text-secondary text-sm">Oversee purchasing requests, orders, and vendor relationships</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-white border border-surface-border text-text-primary px-4 py-2.5 rounded-button font-bold text-sm hover:bg-surface-background transition-all">
             Vendor Analysis
           </button>
           <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
             <Plus className="w-4 h-4" />
             New Purchase Request
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white rounded-card shadow-card border border-surface-border p-8">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold text-text-primary">Purchase History</h3>
               <BarChart3 className="w-5 h-5 text-text-muted" />
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-surface-background text-[10px] font-bold text-text-muted uppercase tracking-widest border-b border-surface-border">
                     <tr>
                        <th className="px-4 py-3">PO Number</th>
                        <th className="px-4 py-3">Vendor</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3 text-center">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                     {[
                       { id: 'PO-00142', vendor: 'Global Office Supplies', amount: '₹12,400', status: 'RECEIVED' },
                       { id: 'PO-00143', vendor: 'Nexus Tech Solutions', amount: '₹1,42,000', status: 'SENT' },
                       { id: 'PO-00144', vendor: 'City Sports Emporium', amount: '₹8,500', status: 'APPROVED' },
                       { id: 'PO-00145', vendor: 'BioMed Lab Kits', amount: '₹42,000', status: 'DRAFT' },
                     ].map((po, i) => (
                       <tr key={i} className="hover:bg-blue-50/20 transition-colors">
                          <td className="px-4 py-4 text-sm font-bold text-primary">{po.id}</td>
                          <td className="px-4 py-4 text-sm font-medium text-text-primary">{po.vendor}</td>
                          <td className="px-4 py-4 text-sm text-text-secondary">{po.amount}</td>
                          <td className="px-4 py-4 text-center">
                             <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                               po.status === 'RECEIVED' ? 'bg-green-100 text-green-600' :
                               po.status === 'SENT' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                             }`}>
                                {po.status}
                             </span>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         <div className="bg-white rounded-card shadow-card border border-surface-border p-6 overflow-hidden">
            <h3 className="text-lg font-bold text-text-primary mb-6">Vendor Performance</h3>
            <div className="space-y-6">
               {[
                 { name: 'Global Office Supplies', rating: 4.8, count: 142 },
                 { name: 'Nexus Tech Solutions', rating: 4.5, count: 24 },
                 { name: 'BioMed Lab Kits', rating: 4.2, count: 12 },
               ].map((v, i) => (
                 <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                       <span className="text-text-primary truncate pr-4">{v.name}</span>
                       <span className="text-primary">{v.rating}/5.0</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-background rounded-full overflow-hidden">
                       <div className="bg-primary h-full" style={{ width: `${(v.rating/5)*100}%` }}></div>
                    </div>
                 </div>
               ))}
            </div>
            <button className="w-full mt-10 py-3 text-xs font-bold text-text-muted hover:text-primary transition-colors border border-surface-border rounded-xl">
               Manage Vendor Database
            </button>
         </div>
      </div>
    </div>
  );
}
