import React from 'react';
import {
  Package,
  AlertTriangle,
  RefreshCcw,
  Home,
  ArrowUpRight,
  BarChart3,
  Plus,
  ArrowDown
} from 'lucide-react';

export default function InventoryDashboard() {
  const stats = [
    { label: 'Total Items', value: '1,248', change: '+12 this week', icon: Package, color: 'bg-blue-600' },
    { label: 'Low Stock Items', value: '24', change: 'Immediate attention', icon: AlertTriangle, color: 'bg-red-500' },
    { label: 'Stock Movements', value: '84', change: 'Last 24 hours', icon: RefreshCcw, color: 'bg-green-500' },
    { label: 'Total Warehouses', value: '4', change: '84% utilized', icon: Home, color: 'bg-indigo-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Inventory Management</h1>
          <p className="text-text-secondary text-sm">Monitor stock levels, movements, and warehouse operations</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-white border border-surface-border text-text-primary px-4 py-2.5 rounded-button font-bold text-sm hover:bg-surface-background transition-all">
             Print Labels
           </button>
           <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
             <Plus className="w-4 h-4" />
             Add New Item
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
         <div className="lg:col-span-2 bg-white rounded-card shadow-card border border-surface-border p-8">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold text-text-primary">Recent Movements</h3>
               <BarChart3 className="w-5 h-5 text-text-muted" />
            </div>
            <div className="space-y-6">
               {[
                 { item: 'A4 Paper (Reams)', qty: '+50', type: 'RECEIPT', warehouse: 'Main Store', date: '10m ago' },
                 { item: 'Dry Erase Markers', qty: '-12', type: 'ISSUE', warehouse: 'Stationery Block', date: '2h ago' },
                 { item: 'Science Lab Beakers', qty: '5', type: 'TRANSFER', warehouse: 'Lab A', date: '4h ago' },
                 { item: 'Library Glue Sticks', qty: '-20', type: 'ISSUE', warehouse: 'Main Store', date: '1d ago' },
               ].map((log, i) => (
                 <div key={i} className="flex items-center justify-between p-4 hover:bg-surface-background rounded-xl transition-all border border-transparent hover:border-surface-border">
                    <div className="flex items-center gap-4">
                       <div className={`p-2 rounded-lg ${log.qty.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          {log.qty.startsWith('+') ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-text-primary">{log.item}</p>
                          <p className="text-[10px] text-text-muted font-bold uppercase">{log.warehouse} • {log.type}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-bold text-text-primary">{log.qty}</p>
                       <p className="text-[10px] text-text-muted">{log.date}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="space-y-6">
            <div className="bg-white rounded-card shadow-card border border-surface-border p-6">
               <h3 className="font-bold text-text-primary mb-6 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Critical Stock Alerts
               </h3>
               <div className="space-y-4">
                  {[
                    { item: 'HP 12A Toner', stock: '2', min: '5', color: 'bg-red-500' },
                    { item: 'Sports Footballs', stock: '4', min: '10', color: 'bg-orange-500' },
                    { item: 'Medical First Aid Kits', stock: '1', min: '3', color: 'bg-red-500' },
                  ].map((alert, i) => (
                    <div key={i} className="space-y-2 p-3 rounded-lg bg-surface-background/50 border border-surface-border">
                       <div className="flex justify-between text-xs font-bold">
                          <span className="text-text-primary">{alert.item}</span>
                          <span className="text-red-600">{alert.stock}/{alert.min}</span>
                       </div>
                       <div className="h-1.5 w-full bg-white rounded-full overflow-hidden">
                          <div className={`${alert.color} h-full`} style={{ width: `${(Number(alert.stock)/Number(alert.min))*100}%` }}></div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
