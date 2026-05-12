'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface BentoCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  hoverEffect?: boolean;
  index?: number;
}

export const BentoCard: React.FC<BentoCardProps> = ({ 
  children, 
  className = '', 
  animate = true,
  hoverEffect = true,
  index = 0,
  ...props
}) => {
  // ── PRECISION UI: Zen Premium Card Style ──
  const content = (
    <div className={`
      rounded-xl border
      shadow-sm overflow-hidden h-full
      ${className}
    `}
    style={{ background: 'var(--surface-card)', borderColor: 'var(--border-card)' }}
    >
      {children}
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hoverEffect ? { 
        y: -6, 
        boxShadow: '0 30px 60px -12px rgba(15,23,42,0.08)',
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
      } : {}}
      transition={{ 
        duration: 0.6, 
        ease: [0.22, 1, 0.36, 1],
        delay: index * 0.05 
      }}
      {...props}
    >
      {content}
    </motion.div>
  );
};
