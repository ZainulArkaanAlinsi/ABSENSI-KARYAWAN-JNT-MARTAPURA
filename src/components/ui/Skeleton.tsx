import React from 'react';

export const BentoSkeleton = ({ className = "" }: { className?: string }) => (
  <div className={`relative overflow-hidden bg-slate-200 dark:bg-slate-800 rounded-3xl ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-white/20 dark:via-white/5 to-transparent" />
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-10 p-2 animate-in fade-in duration-700">
    <div className="flex justify-between items-end mb-4">
       <div className="space-y-4">
          <BentoSkeleton className="h-10 w-64" />
          <BentoSkeleton className="h-4 w-48" />
       </div>
       <div className="flex gap-4">
          <BentoSkeleton className="h-14 w-40" />
          <BentoSkeleton className="h-14 w-40" />
       </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {[1, 2, 3, 4].map((i) => (
        <BentoSkeleton key={i} className="h-40" />
      ))}
    </div>
    <div className="grid grid-cols-12 gap-8 h-[550px]">
      <BentoSkeleton className="col-span-12 lg:col-span-8 h-full" />
      <BentoSkeleton className="col-span-12 lg:col-span-4 h-full" />
    </div>
  </div>
);