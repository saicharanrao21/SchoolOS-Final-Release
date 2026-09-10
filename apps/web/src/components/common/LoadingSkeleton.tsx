import React from 'react';

export function LoadingSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3 animate-pulse py-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-slate-200 rounded-lg"
          style={{ width: `${100 - i * 15}%` }}
        />
      ))}
    </div>
  );
}
