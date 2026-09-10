import React from 'react';
import { FileText, Download, Printer, Filter, Calendar, ChevronRight, BarChart3, PieChart, Landmark } from 'lucide-react';

export default function ReportsPage() {
  const mainReports = [
    { title: 'Trial Balance', desc: 'Summary of all account balances', icon: Landmark },
    { title: 'Profit & Loss', desc: 'Income and expense summary', icon: PieChart },
    { title: 'Balance Sheet', desc: 'Assets, liabilities and equity', icon: BarChart3 },
    { title: 'General Ledger', desc: 'Detailed transaction list by account', icon: FileText },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Financial Reports</h1>
        <p className="text-text-secondary text-sm">Generate authoritative institutional financial statements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {mainReports.map((report) => (
           <div key={report.title} className="bg-white p-6 rounded-card shadow-card border border-surface-border group hover:border-primary transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                 <report.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-text-primary">{report.title}</h3>
              <p className="text-xs text-text-muted mt-1">{report.desc}</p>
              <div className="mt-6 pt-4 border-t border-surface-border flex items-center justify-between text-primary font-bold text-xs">
                 <span>Generate</span>
                 <ChevronRight className="w-4 h-4" />
              </div>
           </div>
         ))}
      </div>

      <div className="bg-white rounded-card shadow-card border border-surface-border">
         <div className="p-6 border-b border-surface-border flex items-center justify-between bg-surface-background/20">
            <h3 className="font-bold text-text-primary">Report Configuration</h3>
            <div className="flex gap-4">
               <div className="flex items-center gap-2 text-xs font-bold text-text-muted px-3 py-1.5 bg-white rounded-lg border">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  FY 2026-27
               </div>
               <div className="flex items-center gap-2 text-xs font-bold text-text-muted px-3 py-1.5 bg-white rounded-lg border">
                  <Filter className="w-3.5 h-3.5 text-primary" />
                  All Campuses
               </div>
            </div>
         </div>

         <div className="p-10 flex flex-col items-center justify-center text-center space-y-6 opacity-40 py-24">
            <div className="w-20 h-20 rounded-full bg-surface-background flex items-center justify-center">
               <FileText className="w-10 h-10 text-text-muted" />
            </div>
            <div>
               <h4 className="font-bold text-text-primary uppercase tracking-widest text-sm">Select a report to preview</h4>
               <p className="text-xs text-text-muted mt-2">Authority financial statements will be generated based on the selected criteria.</p>
            </div>
         </div>
      </div>
    </div>
  );
}
