import React from 'react';
import { Card } from '../common/Card';
import { Wallet, TrendingUp } from 'lucide-react';

export function FinanceChartWidget() {
  return (
    <Card
      title="Fee Collection & Financial Snapshot"
      subtitle="Billed demand vs collected revenue for active academic session"
      action={
        <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <TrendingUp className="w-3.5 h-3.5" /> +12% Collection Velocity
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3 text-center p-4 bg-surface-background rounded-xl border border-surface-border">
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase">Total Billed</p>
            <p className="text-lg font-bold text-text-primary">$1,620,000</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase">Collected</p>
            <p className="text-lg font-bold text-emerald-600">$1,425,600</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase">Outstanding</p>
            <p className="text-lg font-bold text-amber-600">$194,400</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-text-secondary">Term Collection Progress</span>
            <span className="text-primary font-bold">88%</span>
          </div>
          <div className="w-full h-3 bg-surface-border rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: '88%' }} />
          </div>
        </div>
      </div>
    </Card>
  );
}
