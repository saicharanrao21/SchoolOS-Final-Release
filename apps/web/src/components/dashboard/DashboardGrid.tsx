'use client';

import React from 'react';
import { KpiSummaryWidget } from './KpiSummaryWidget';
import { FinanceChartWidget } from './FinanceChartWidget';
import { AttendanceWidget } from './AttendanceWidget';
import { WorkflowApprovalsWidget } from './WorkflowApprovalsWidget';
import { SecurityVisitorsWidget } from './SecurityVisitorsWidget';

export function DashboardGrid() {
  return (
    <div className="space-y-6">
      {/* Top Full Width KPI Summary */}
      <KpiSummaryWidget />

      {/* Middle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FinanceChartWidget />
        <AttendanceWidget />
      </div>

      {/* Bottom Operations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WorkflowApprovalsWidget />
        <SecurityVisitorsWidget />
      </div>
    </div>
  );
}
