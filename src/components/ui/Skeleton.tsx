'use client';

import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
}

export function Skeleton({ className = '', variant = 'rect' }: SkeletonProps) {
  const baseStyles = "bg-[var(--bg-input)] relative overflow-hidden";
  const variantStyles = {
    rect: "rounded-2xl",
    circle: "rounded-full",
    text: "rounded-lg h-4 w-full"
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      <motion.div
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent w-full h-full"
      />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass-premium p-7 rounded-[32px] border border-white/5 space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="w-10 h-10 rounded-2xl" />
        <Skeleton className="w-12 h-4" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-24 h-3" />
        <Skeleton className="w-16 h-8" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="w-12 h-1" />
        <Skeleton className="w-20 h-3" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="glass-premium p-8 rounded-[40px] border border-white/5 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="w-32 h-6" />
          <Skeleton className="w-24 h-3" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="w-8 h-8 rounded-xl" />
          <Skeleton className="w-16 h-8 rounded-xl" />
        </div>
      </div>
      <Skeleton className="w-full h-[220px]" />
    </div>
  );
}
