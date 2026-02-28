import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
}

export default function LoadingSpinner({ size = 24, color = '#E04B3A' }: LoadingSpinnerProps) {
  return (
    <motion.div
      style={{ width: size, height: size }}
      className="relative"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      {/* Lingkaran luar dengan gradien */}
      <div
        className="absolute inset-0 rounded-full border-2 border-transparent"
        style={{
          borderTopColor: color,
          borderRightColor: `${color}80`,
          borderBottomColor: `${color}40`,
          borderLeftColor: 'transparent',
        }}
      />
      {/* Lingkaran dalam untuk efek depth */}
      <div
        className="absolute inset-1 rounded-full border border-transparent"
        style={{
          borderTopColor: `${color}60`,
          borderRightColor: `${color}30`,
          borderBottomColor: 'transparent',
          borderLeftColor: 'transparent',
        }}
      />
    </motion.div>
  );
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-4" style={{ minHeight: 300 }}>
      <LoadingSpinner size={40} color="#E04B3A" />
      <p
        className="text-xs font-medium uppercase tracking-widest"
        style={{ color: '#9BA4B4' }}
      >
        Loading...
      </p>
    </div>
  );
}