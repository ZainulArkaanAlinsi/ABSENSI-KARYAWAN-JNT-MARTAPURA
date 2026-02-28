'use client';

import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
}

export function Skeleton({ className = '', variant = 'rect' }: SkeletonProps) {
  const baseStyles = "relative overflow-hidden";
  const variantStyles = {
    rect: "rounded-xl",
    circle: "rounded-full",
    text: "rounded-md h-4 w-full"
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={{ backgroundColor: '#1B2A4A' }}
    >
      <motion.div
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(224,75,58,0.1), transparent)',
        }}
      />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div
      className="p-6 rounded-2xl border border-white/10 space-y-4"
      style={{ backgroundColor: '#1B2A4A' }}
    >
      <div className="flex justify-between items-center">
        <Skeleton className="w-10 h-10 rounded-xl" variant="rect" />
        <Skeleton className="w-12 h-4" variant="text" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-24 h-3" variant="text" />
        <Skeleton className="w-16 h-8" variant="text" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="w-12 h-1" variant="rect" />
        <Skeleton className="w-20 h-3" variant="text" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div
      className="p-6 rounded-2xl border border-white/10 space-y-6"
      style={{ backgroundColor: '#1B2A4A' }}
    >
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="w-32 h-6" variant="text" />
          <Skeleton className="w-24 h-3" variant="text" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="w-8 h-8 rounded-lg" variant="rect" />
          <Skeleton className="w-16 h-8 rounded-lg" variant="rect" />
        </div>
      </div>
      <Skeleton className="w-full h-[220px] rounded-xl" variant="rect" />
    </div>
  );
}

// Tambahan skeleton untuk tabel
export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-white/5">
      <Skeleton className="w-10 h-10 rounded-full" variant="circle" />
      <div className="flex-1 space-y-2">
        <Skeleton className="w-3/4 h-4" variant="text" />
        <Skeleton className="w-1/2 h-3" variant="text" />
      </div>
      <Skeleton className="w-20 h-8 rounded-lg" variant="rect" />
    </div>
  );
}

// Tambahan skeleton untuk list item
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 border-b border-white/5">
      <Skeleton className="w-8 h-8 rounded-full" variant="circle" />
      <div className="flex-1">
        <Skeleton className="w-40 h-4 mb-1" variant="text" />
        <Skeleton className="w-24 h-3" variant="text" />
      </div>
    </div>
  );
}