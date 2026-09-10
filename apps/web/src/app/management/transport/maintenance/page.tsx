'use client';

import React, { useState } from 'react';
import {
  Wrench,
  Bus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  ShieldAlert,
  Calendar,
  DollarSign,
  FileCheck
} from 'lucide-react';

export default function TransportMaintenancePage() {
  const [filter, setFilter] = useState('ALL');

  const maintenanceRecords = [
    {
      id: 'maint-1',
      vehicleNumber: 'BUS-001',
      registrationNumber: 'KA-01-EA-1234',
      type: 'PREVENTIVE',
      description: 'Scheduled 10,000 km Service & Brake Inspection',
      vendor: 'Universal Auto Garage',
      cost: '$350.00',
      scheduledDate: '2026-09-10',
      status: 'SCHEDULED',
      odometer: '12,450 km',
    },
    {
      id: 'maint-2',
      vehicleNumber: 'VAN-002',
      registrationNumber: 'KA-01-EA-5678',
      type: 'CORRECTIVE',
      description: 'AC Compressor Replacement',
      vendor: 'Cooling Specialist Ltd',
      cost: '$620.00',
      scheduledDate: '2026-09-02',
      status: 'IN_PROGRESS',
      odometer: '28,100 km',
    },
    {
      id: 'maint-3',
      vehicleNumber: 'BUS-004',
      registrationNumber: 'KA-01-EA-9101',
      type: 'ROUTINE',
      description: 'Engine Oil & Filter Change',
      vendor: 'School Fleet Depot',
      cost: '$120.00',
      scheduledDate: '2026-08-25',
      status: 'COMPLETED',
      odometer: '8,900 km',
    },
  ];

  const complianceAlerts = [
    { vehicle: 'BUS-003', document: 'Fitness Certificate', expiry: 'Expires in 12 days', status: 'WARNING' },
    { vehicle: 'VAN-001', document: 'Pollution Certificate', expiry: 'Expired 2 days ago', status: 'CRITICAL' },
    { vehicle: 'BUS-005', document: 'Insurance Policy', expiry: 'Expires in 28 days', status: 'INFO' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Fleet Maintenance & Compliance</h1>
          <p className="text-text-secondary text-sm">Vehicle service schedules, repair logs, and regulatory document monitoring</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Schedule Service
          </button>
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="bg-white p-6 rounded-card shadow-card border border-surface-border">
        <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2 text-primary">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          Regulatory Compliance Alerts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {complianceAlerts.map((alert, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border flex items-center justify-between ${
                alert.status === 'CRITICAL'
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : alert.status === 'WARNING'
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileCheck className="w-5 h-5" />
                <div>
                  <p className="font-bold text-sm">{alert.vehicle} - {alert.document}</p>
                  <p className="text-xs opacity-80">{alert.expiry}</p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-white/60">
                {alert.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-surface-border pb-2">
        {['ALL', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${
              filter === st
                ? 'bg-primary text-white shadow'
                : 'text-text-muted hover:bg-surface-background'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Maintenance Table */}
      <div className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-background border-b border-surface-border text-xs uppercase text-text-muted font-bold">
            <tr>
              <th className="p-4">Vehicle</th>
              <th className="p-4">Type</th>
              <th className="p-4">Description</th>
              <th className="p-4">Vendor</th>
              <th className="p-4">Scheduled Date</th>
              <th className="p-4">Cost</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {maintenanceRecords
              .filter((r) => filter === 'ALL' || r.status === filter)
              .map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-text-primary">
                    <div className="flex items-center gap-2">
                      <Bus className="w-4 h-4 text-primary" />
                      <div>
                        <p>{rec.vehicleNumber}</p>
                        <p className="text-[10px] text-text-muted">{rec.registrationNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-xs">
                    <span className="bg-surface-background px-2 py-1 rounded text-text-secondary border border-surface-border">
                      {rec.type}
                    </span>
                  </td>
                  <td className="p-4 text-text-secondary font-medium">{rec.description}</td>
                  <td className="p-4 text-text-muted text-xs">{rec.vendor}</td>
                  <td className="p-4 text-text-muted text-xs">{rec.scheduledDate}</td>
                  <td className="p-4 font-bold text-text-primary">{rec.cost}</td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                        rec.status === 'COMPLETED'
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : rec.status === 'IN_PROGRESS'
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-amber-50 border-amber-200 text-amber-700'
                      }`}
                    >
                      {rec.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
