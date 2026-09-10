import React from 'react';
import {
  Bus,
  Route,
  Users,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Navigation,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Plus
} from 'lucide-react';

export default function TransportDashboard() {
  const stats = [
    { label: 'Active Vehicles', value: '18', change: '2 in Service', icon: Bus, color: 'bg-blue-600' },
    { label: 'Active Trips', value: '12', change: '8 Started', icon: Navigation, color: 'bg-green-500' },
    { label: 'Students Assigned', value: '482', change: '92% coverage', icon: Users, color: 'bg-indigo-600' },
    { label: 'Safety Incidents', value: '0', change: 'Last 24h', icon: ShieldCheck, color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Transport Command Center</h1>
          <p className="text-text-secondary text-sm">Real-time institutional fleet and child safety monitoring</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-white border border-surface-border text-text-primary px-4 py-2.5 rounded-button font-bold text-sm hover:bg-surface-background transition-all">
             Safety Logs
           </button>
           <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
             <Plus className="w-4 h-4" />
             New Route
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
         <div className="lg:col-span-2 bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
            <div className="p-6 border-b border-surface-border flex items-center justify-between">
               <h3 className="text-lg font-bold text-text-primary text-primary flex items-center gap-2">
                 <Navigation className="w-5 h-5" />
                 Live Fleet Map
               </h3>
               <div className="flex gap-2">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    8 On Route
                  </span>
               </div>
            </div>
            <div className="h-[400px] bg-slate-50 relative flex items-center justify-center">
               {/* Map Placeholder */}
               <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/0,0,1,0,0/600x400?access_token=mock')] bg-cover opacity-20"></div>
               <div className="z-10 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center mx-auto border-2 border-primary/20">
                     <MapPin className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-text-primary">Geospatial Engine Ready</p>
                    <p className="text-xs text-text-muted">Live vehicle positions will appear here during active trips.</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="space-y-6">
            <div className="bg-white rounded-card shadow-card border border-surface-border p-6">
               <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Active Alerts
               </h3>
               <div className="space-y-4">
                  {[
                    { title: 'Route Deviation', sub: 'Bus 04 - North Route', type: 'warning' },
                    { title: 'Delay Detected', sub: 'Van 02 - 15m Late', type: 'info' },
                    { title: 'GPS Offline', sub: 'Bus 12 - Maintenance', type: 'error' },
                  ].map((alert, i) => (
                    <div key={i} className="p-3 rounded-xl bg-surface-background border border-surface-border flex items-start gap-3">
                       <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${alert.type === 'error' ? 'bg-red-500' : alert.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                       <div>
                          <p className="text-sm font-bold text-text-primary">{alert.title}</p>
                          <p className="text-[10px] text-text-muted font-bold uppercase">{alert.sub}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-white rounded-card shadow-card border border-surface-border p-6">
               <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2 text-primary">
                  <Bus className="w-5 h-5" />
                  Fleet Status
               </h3>
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                     <span className="font-medium text-text-secondary">On Route</span>
                     <span className="font-bold text-text-primary">8</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="font-medium text-text-secondary">At School</span>
                     <span className="font-bold text-text-primary">6</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="font-medium text-text-secondary">Maintenance</span>
                     <span className="font-bold text-text-primary">2</span>
                  </div>
                  <div className="pt-2 border-t border-surface-border">
                    <button className="text-primary font-bold text-xs hover:underline flex items-center gap-1">
                      Manage Fleet <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
