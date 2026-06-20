'use client';

import React from 'react';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  animationType?: 'pop' | 'lift' | 'tilt';
}

// Micro-interaksi pakai CSS transition (transform GPU-composited) — menggantikan
// animasi JS animejs lama. Lebih hemat & FPS lebih halus tanpa dependency.
const hoverClass: Record<NonNullable<AnimatedButtonProps['animationType']>, string> = {
  pop: 'hover:scale-105',
  lift: 'hover:-translate-y-[3px] hover:scale-[1.02]',
  tilt: 'hover:scale-[1.02] hover:rotate-1',
};

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  animationType = 'pop',
  className,
  ...props
}) => {
  return (
    <button
      className={`transition-transform duration-200 ease-out will-change-transform active:scale-95 ${hoverClass[animationType]} ${className ?? ''}`}
      {...props}
    >
      {children}
    </button>
  );
};
