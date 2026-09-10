import React from 'react';
import { Card } from '../common/Card';
import { CheckCircle2, UserX, Clock, Cpu } from 'lucide-react';

export function AttendanceWidget() {
  return (
    <Card
      title="Today Attendance & Biometric Sync"
      subtitle="Real-time check-in records from ADMS biometric devices"
      action={
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
          <Cpu className="w-3 h-3 text-primary animate-pulse" /> ADMS Live Sync
        </span>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-green-50/60 rounded-xl border border-green-200 text-center">
            <div className="flex items-center justify-center gap-1 text-green-700 font-bold text-xs mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Present
            </div>
            <p className="text-xl font-bold text-green-800">2,738</p>
          </div>

          <div className="p-3 bg-red-50/60 rounded-xl border border-red-200 text-center">
            <div className="flex items-center justify-center gap-1 text-red-700 font-bold text-xs mb-1">
              <UserX className="w-3.5 h-3.5" /> Absent
            </div>
            <p className="text-xl font-bold text-red-800">102</p>
          </div>

          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-center">
            <div className="flex items-center justify-center gap-1 text-amber-700 font-bold text-xs mb-1">
              <Clock className="w-3.5 h-3.5" /> Late
            </div>
            <p className="text-xl font-bold text-amber-800">24</p>
          </div>
        </div>

        <div className="p-3 bg-surface-background rounded-xl border border-surface-border text-xs text-text-secondary flex items-center justify-between">
          <span className="font-semibold">Last Biometric Sync:</span>
          <span className="font-bold text-text-primary">12 seconds ago (Gate 1 & Gate 2)</span>
        </div>
      </div>
    </Card>
  );
}
