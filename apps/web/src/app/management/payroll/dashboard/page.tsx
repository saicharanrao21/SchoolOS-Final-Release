import React from 'react';
import {
  Wallet,
  Plus,
  BarChart3,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  FileText,
  Activity,
  ArrowRight
} from 'lucide-react';

export default function PayrollDashboard() {
  const stats = [
    { label: 'Net Pay (This Month)', value: '₹42,50,000', change: '+2.4%', icon: Wallet, color: 'bg-blue-600' },
    { label: 'Employees Paid', value: '138/142', change: '4 pending', icon: CheckCircle2, color: 'bg-green-500' },
    { label: 'Total Deductions', value: '₹8,42,000', change: 'Statutory: 85%', icon: Activity, color: 'bg-orange-500' },
    { label: 'Loan Recovery', value: '₹1,24,000', change: 'Active: 12', icon: Clock, color: 'bg-indigo-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Payroll Command Center</h1>
          <p className="text-text-secondary text-sm">Automated compensation processing and financial compliance</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-white border border-surface-border text-text-primary px-4 py-2.5 rounded-button font-bold text-sm hover:bg-surface-background transition-all">
             Statutory Reports
           </button>
           <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
             <Plus className="w-4 h-4" />
             New Payroll Run
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
              <p className="text-2xl font-bold text-text-primary mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white rounded-card shadow-card border border-surface-border p-8">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold text-text-primary">Payroll History</h3>
               <BarChart3 className="w-5 h-5 text-text-muted" />
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-surface-background text-[10px] font-bold text-text-muted uppercase tracking-widest border-b border-surface-border">
                     <tr>
                        <th className="px-4 py-3">Pay Period</th>
                        <th className="px-4 py-3">Employees</th>
                        <th className="px-4 py-3">Total Net</th>
                        <th className="px-4 py-3 text-center">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                     {[
                       { period: 'August 2026', count: 142, amount: '₹42,50,000', status: 'LOCKED' },
                       { period: 'July 2026', count: 140, amount: '₹41,20,000', status: 'PAID' },
                       { period: 'June 2026', count: 138, amount: '₹40,80,000', status: 'PAID' },
                       { period: 'May 2026', count: 138, amount: '₹40,50,000', status: 'PAID' },
                     ].map((run, i) => (
                       <tr key={i} className="hover:bg-blue-50/20 transition-colors">
                          <td className="px-4 py-4 text-sm font-bold text-text-primary">{run.period}</td>
                          <td className="px-4 py-4 text-sm text-text-secondary">{run.count} Staff</td>
                          <td className="px-4 py-4 text-sm font-bold text-primary">{run.amount}</td>
                          <td className="px-4 py-4 text-center">
                             <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                               run.status === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'
                             }`}>
                                {run.status}
                             </span>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         <div className="bg-white rounded-card shadow-card border border-surface-border p-6 overflow-hidden">
            <h3 className="text-lg font-bold text-text-primary mb-6">Upcoming Disbursements</h3>
            <div className="space-y-5">
               {[
                 { item: 'Staff Reimbursements', count: 12, amount: '₹24,500' },
                 { item: 'Advance Requests', count: 4, amount: '₹85,000' },
                 { item: 'Bonus (Diwali)', count: 142, amount: '₹14,20,000' },
               ].map((item, i) => (
                 <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-surface-background/50 border border-surface-border">
                    <div>
                       <p className="text-sm font-bold text-text-primary">{item.item}</p>
                       <p className="text-[10px] text-text-muted font-bold">{item.count} items</p>
                    </div>
                    <p className="text-sm font-bold text-primary">{item.amount}</p>
                 </div>
               ))}
            </div>
            <button className="w-full mt-10 py-3 text-xs font-bold text-primary border-t border-surface-border hover:underline">
               Review Pending Requests
            </button>
         </div>
      </div>
    </div>
  );
}
