'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import React from 'react';

interface InteractiveButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  stopPropagation?: boolean;
}

export const InteractiveButton = ({ 
  children, 
  stopPropagation = false, 
  onClick, 
  className = "", 
  ...props 
}: InteractiveButtonProps) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) {
      e.stopPropagation();
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      onClick={handleClick}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export const GlassCard = ({ children, className = "", ...props }: HTMLMotionProps<"div">) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className={`bento-card ${className}`}
    {...props}
  >
    {children}
  </motion.div>
);
