import React from 'react';
import {
  Wallet,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  PieChart,
  BarChart3,
  Search,
  Filter
} from 'lucide-react';

export default function FinanceDashboard() {
  const stats = [
    { label: 'Total Billed', value: '₹48.2L', change: '+8%', icon: Wallet, color: 'bg-blue-600' },
    { label: 'Total Collected', value: '₹32.5L', change: '+12%', icon: CheckCircle2, color: 'bg-green-500' },
    { label: 'Outstanding', value: '₹15.7L', change: '-2%', icon: Clock, color: 'bg-orange-500' },
    { label: 'Overdue', value: '₹4.2L', change: '+1%', icon: AlertCircle, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Financial Command Center</h1>
          <p className="text-text-secondary text-sm">Real-time overview of school fee collections and health</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-surface-border text-text-primary px-4 py-2.5 rounded-button font-bold text-sm hover:bg-surface-background transition-all">
            Download Statement
          </button>
          <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Revenue Analysis
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
              <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                {stat.change}
                <ArrowUpRight className="w-3 h-3" />
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
              <h3 className="text-lg font-bold text-text-primary">Monthly Collection Trend</h3>
              <div className="flex gap-2">
                 <button className="px-3 py-1 text-xs font-bold bg-primary text-white rounded-lg">Collections</button>
                 <button className="px-3 py-1 text-xs font-bold text-text-muted hover:bg-surface-background rounded-lg">Expenses</button>
              </div>
           </div>

           <div className="h-64 w-full bg-surface-background/50 rounded-2xl flex items-end justify-around p-6 gap-4 border border-dashed border-surface-border">
              {[40, 70, 45, 90, 65, 80, 55, 30].map((h, i) => (
                <div key={i} className="flex-1 space-y-2">
                   <div className="bg-primary rounded-t-lg transition-all hover:bg-primary-dark cursor-pointer" style={{ height: `${h}%` }}></div>
                   <p className="text-[10px] font-bold text-text-muted text-center uppercase tracking-tighter">Month {i+1}</p>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
          <div className="p-6 border-b border-surface-border">
            <h3 className="text-lg font-bold text-text-primary">Recent Transactions</h3>
          </div>
          <div className="divide-y divide-surface-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-surface-background transition-colors">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                     <CheckCircle2 className="w-4 h-4" />
                   </div>
                   <div>
                     <p className="text-sm font-bold text-text-primary">₹24,500</p>
                     <p className="text-[10px] text-text-muted font-medium uppercase tracking-widest">Alice Johnson • Grade 10</p>
                   </div>
                </div>
                <span className="text-[10px] font-bold text-text-muted">2m ago</span>
              </div>
            ))}
          </div>
          <button className="w-full py-4 text-xs font-bold text-primary hover:bg-primary-light transition-all border-t border-surface-border">
            View All Transactions
          </button>
        </div>
      </div>
    </div>
  );
}
