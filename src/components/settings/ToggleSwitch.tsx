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
  const width = size === 'small' ? 'w-9' : 'w-11';
  const height = size === 'small' ? 'h-5' : 'h-6';
  const ballSize = size === 'small' ? 'w-4 h-4' : 'w-5 h-5';
  const xPos = size === 'small' ? (checked ? 16 : 2) : (checked ? 20 : 2);

  return (
    <div className="flex items-center justify-between w-full">
      {(label || description) && (
        <div className="shrink-0 mr-4">
          {label && <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{label}</p>}
          {description && <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</p>}
        </div>
      )}
      <div
        className={`${width} ${height} rounded-full relative shrink-0 transition-all cursor-pointer border`}
        style={{ 
          background: checked ? 'var(--color-success)' : 'var(--bg-input)',
          borderColor: checked ? 'var(--color-success)' : 'var(--border-primary)'
        }}
        onClick={onChange}
      >
        <motion.div
          animate={{ x: xPos }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`absolute top-0.5 ${ballSize} rounded-full bg-white shadow`}
        />
      </div>
    </div>
  );
}