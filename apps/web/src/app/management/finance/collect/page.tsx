import React from 'react';
import { Search, User, CreditCard, Banknote, ShieldCheck, ArrowRight, Wallet, History } from 'lucide-react';

export default function CollectFeePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Collect Fee</h1>
        <p className="text-text-secondary text-sm">Record manual/offline payments and issue receipts</p>
      </div>

      <div className="bg-white rounded-card shadow-card border border-surface-border p-8">
        <div className="space-y-6">
          <div>
            <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2 block">1. Search Student</label>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Enter Admission Number or Student Name..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-surface-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-lg font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
             <div className="p-6 bg-surface-background rounded-2xl border border-surface-border flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-xl">
                  AJ
                </div>
                <div>
                  <p className="font-bold text-text-primary text-lg">Alice Johnson</p>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-widest">GA260001 • Grade 10-A</p>
                </div>
             </div>

             <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100 flex items-center justify-between">
                <div>
                   <p className="text-xs font-bold text-orange-600 uppercase tracking-widest">Outstanding Balance</p>
                   <p className="text-2xl font-bold text-orange-700">₹15,700</p>
                </div>
                <Wallet className="w-8 h-8 text-orange-400 opacity-50" />
             </div>
          </div>

          <div className="space-y-6 pt-8 border-t border-surface-border">
             <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">2. Payment Details</h3>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary">Amount to Collect (₹)</label>
                  <input type="number" defaultValue="15700" className="w-full px-4 py-3 rounded-lg border border-surface-border focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-lg" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                     <button className="flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-primary bg-primary-light text-primary font-bold text-xs">
                        <Banknote className="w-4 h-4" />
                        CASH
                     </button>
                     <button className="flex items-center justify-center gap-2 py-3 rounded-lg border border-surface-border text-text-secondary hover:bg-surface-background font-bold text-xs">
                        <CreditCard className="w-4 h-4" />
                        UPI / CARD
                     </button>
                  </div>
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary">Transaction Reference / Notes</label>
                <textarea rows={2} placeholder="Optional notes about the transaction..." className="w-full px-4 py-3 rounded-lg border border-surface-border focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"></textarea>
             </div>
          </div>

          <div className="pt-8 flex items-center justify-between border-t border-surface-border">
             <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
                Authorized Transaction
             </div>
             <button className="bg-primary text-white px-10 py-4 rounded-button font-bold shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-3 text-lg">
                Record Payment
                <ArrowRight className="w-5 h-5" />
             </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-card shadow-card border border-surface-border p-6 flex items-center justify-between group cursor-pointer hover:border-primary/20 transition-all">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-surface-background flex items-center justify-center text-text-muted">
               <History className="w-5 h-5" />
            </div>
            <div>
               <p className="text-sm font-bold text-text-primary">Payment History</p>
               <p className="text-xs text-text-muted">View last 5 transactions for this student</p>
            </div>
         </div>
         <ChevronRight className="w-5 h-5 text-text-muted" />
      </div>
    </div>
  );
}

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
