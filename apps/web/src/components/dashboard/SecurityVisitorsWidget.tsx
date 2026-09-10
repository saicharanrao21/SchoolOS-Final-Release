import React from 'react';
import { Card } from '../common/Card';
import { ShieldCheck, UserCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function SecurityVisitorsWidget() {
  return (
    <Card
      title="Gate Security & Active Pickups"
      subtitle="Visitors checked-in on campus and verified student releases"
      action={
        <Link href="/management/security/dashboard" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
          Security Console <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-[10px] font-bold text-text-muted uppercase">Visitors On Campus</p>
          <p className="text-xl font-bold text-text-primary">18 Active</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-[10px] font-bold text-blue-700 uppercase">Verified Pickups</p>
          <p className="text-xl font-bold text-blue-900">12 Released</p>
        </div>
      </div>
    </Card>
  );
}
