import React from 'react';
import { Plus, Search, Filter, Layers, MoreVertical, ChevronRight, Copy } from 'lucide-react';

export default function FeeStructuresPage() {
  const structures = [
    { name: 'Annual Composite Fee 2026-27', class: 'Grade 10', category: 'Tuition', total: '₹85,000', components: 4, installments: 4 },
    { name: 'Primary Basic Fee 2026-27', class: 'Grade 1 - 5', category: 'Tuition', total: '₹62,000', components: 3, installments: 2 },
    { name: 'Transport Fee - North Zone', class: 'All Classes', category: 'Transport', total: '₹12,000', components: 1, installments: 12 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Fee Structures</h1>
          <p className="text-text-secondary text-sm">Define and manage fee templates for academic sessions</p>
        </div>
        <button className="bg-primary text-white px-5 py-2.5 rounded-button font-bold text-sm shadow-md flex items-center gap-2 hover:bg-primary-dark transition-all">
          <Plus className="w-4 h-4" />
          Create Structure
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {structures.map((s) => (
          <div key={s.name} className="bg-white rounded-card shadow-card border border-surface-border p-6 flex items-center justify-between group hover:border-primary/20 transition-all">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center text-primary">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-text-primary text-lg">{s.name}</h3>
                <div className="flex items-center gap-4 mt-1">
                   <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest bg-surface-background px-2 py-0.5 rounded border border-surface-border">{s.class}</span>
                   <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary-light px-2 py-0.5 rounded">{s.category}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-12">
               <div className="text-right">
                  <p className="text-xl font-bold text-text-primary">{s.total}</p>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{s.installments} Installments</p>
               </div>
               <div className="flex gap-2">
                 <button className="p-2.5 hover:bg-surface-background rounded-lg text-text-muted transition-colors" title="Clone">
                    <Copy className="w-4 h-4" />
                 </button>
                 <button className="p-2.5 hover:bg-surface-background rounded-lg text-text-muted transition-colors">
                    <MoreVertical className="w-5 h-5" />
                 </button>
                 <button className="p-2.5 bg-surface-background rounded-lg text-primary hover:bg-primary-light transition-all">
                    <ChevronRight className="w-5 h-5" />
                 </button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
