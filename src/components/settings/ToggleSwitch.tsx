'use client';

import { motion } from 'framer-motion';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
  description?: string;
  size?: 'default' | 'small';
}

export default function ToggleSwitch({ checked, onChange, label, description, size = 'default' }: ToggleSwitchProps) {
  const width = size === 'small' ? 'w-10' : 'w-14';
  const height = size === 'small' ? 'h-6' : 'h-8';
  const ballSize = size === 'small' ? 'w-4 h-4' : 'w-6 h-6';
  const xPos = size === 'small' ? (checked ? 16 : 4) : (checked ? 24 : 4);

  return (
    <div className="flex items-center justify-between w-full gap-6">
      {(label || description) && (
        <div className="shrink min-w-0">
          {label && (
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-900">
              {label}
            </p>
          )}
          {description && (
            <p className="text-[10px] font-bold text-slate-400 mt-1 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}
      <div
        className={`${width} ${height} rounded-full relative shrink-0 cursor-pointer transition-all duration-300 ${
          checked ? 'bg-primary shadow-lg shadow-primary/20 border-transparent' : 'bg-slate-100 border-slate-200'
        } border`}
        onClick={onChange}
      >
        <motion.div
          animate={{ x: xPos }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`absolute top-1/2 -translate-y-1/2 ${ballSize} rounded-full bg-white shadow-xl flex items-center justify-center`}
        >
           {checked && (
             <div className="w-1.5 h-1.5 rounded-full bg-primary" />
           )}
        </motion.div>
      </div>
    </div>
  );
}