'use client';

import React from 'react';
import { motion } from 'framer-motion';

// ─── Animated Truck (moves left→right in a loop) ─────────────────────────────
const TruckSVG = () => (
  <svg width="80" height="44" viewBox="0 0 80 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Truck body */}
    <rect x="2" y="10" width="46" height="26" rx="3" fill="#004080" />
    {/* Cargo box on back */}
    <rect x="4" y="13" width="30" height="20" rx="2" fill="#E31E24" />
    {/* JNE text on cargo */}
    <text x="9" y="27" fontSize="7" fontWeight="bold" fill="white" fontFamily="sans-serif">JNE</text>
    {/* Cab */}
    <rect x="36" y="14" width="16" height="22" rx="2" fill="#002D5C" />
    {/* Windshield */}
    <rect x="38" y="16" width="11" height="9" rx="1.5" fill="#93C5FD" opacity="0.9" />
    {/* Front bumper */}
    <rect x="50" y="28" width="4" height="6" rx="1" fill="#1a3a6e" />
    {/* Wheels */}
    <circle cx="13" cy="37" r="5.5" fill="#1F2937" />
    <circle cx="13" cy="37" r="2.5" fill="#9CA3AF" />
    <circle cx="40" cy="37" r="5.5" fill="#1F2937" />
    <circle cx="40" cy="37" r="2.5" fill="#9CA3AF" />
    <circle cx="58" cy="37" r="5.5" fill="#1F2937" />
    <circle cx="58" cy="37" r="2.5" fill="#9CA3AF" />
  </svg>
);

// ─── Box Unboxing SVG ─────────────────────────────────────────────────────────
const BoxSVG = ({ open }: { open: boolean }) => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Box bottom */}
    <rect x="6" y="22" width="40" height="24" rx="3" fill="#E31E24" />
    {/* Box stripe */}
    <rect x="24" y="22" width="4" height="24" fill="#C01A1F" opacity="0.6" />
    {/* Box lid — rotates open */}
    <motion.g
      style={{ transformOrigin: '26px 22px' }}
      animate={{ rotateX: open ? -55 : 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <rect x="4" y="14" width="44" height="10" rx="3" fill="#004080" />
      <rect x="23" y="14" width="6" height="10" fill="#002D5C" opacity="0.5" />
    </motion.g>
    {/* Check mark inside box when open */}
    <motion.g
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: open ? 1 : 0, scale: open ? 1 : 0.5 }}
      transition={{ delay: 0.4, duration: 0.3 }}
      style={{ transformOrigin: '26px 34px' }}
    >
      <circle cx="26" cy="34" r="8" fill="white" opacity="0.25" />
      <path d="M21 34l3.5 3.5L31 30" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </motion.g>
  </svg>
);

// ─── Road dots animation ──────────────────────────────────────────────────────
const RoadDots = () => (
  <div className="flex items-center gap-2 mt-1">
    {[0, 1, 2, 3, 4].map((i) => (
      <motion.div
        key={i}
        className="h-1 rounded-full bg-jne-blue/30"
        style={{ width: i % 2 === 0 ? 20 : 8 }}
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.2, delay: i * 0.15, repeat: Infinity }}
      />
    ))}
  </div>
);

// ─── Exported loader variants ─────────────────────────────────────────────────

/** Full-page overlay loader */
export function JNEPageLoader({ message = 'Memuat data...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-jne-gray">
      <motion.div
        className="flex flex-col items-center gap-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* JNE Branding */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: '#E31E24' }}>
            <span className="text-white font-black text-base select-none">J</span>
          </div>
          <div>
            <p className="font-extrabold text-[15px] text-jne-blue leading-none">JNE Martapura</p>
            <p className="text-[11px] text-jne-blue/60 mt-0.5">Admin Panel</p>
          </div>
        </div>

        {/* Truck animation */}
        <div className="relative overflow-hidden w-[200px]">
          <motion.div
            animate={{ x: [-90, 200] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
          >
            <TruckSVG />
          </motion.div>
          <RoadDots />
        </div>

        {/* Spinner dots */}
        <div className="flex gap-2 mt-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-jne-red"
              animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.8, delay: i * 0.18, repeat: Infinity }}
            />
          ))}
        </div>

        <p className="text-[13px] font-medium text-jne-blue/70">{message}</p>
      </motion.div>
    </div>
  );
}

/** Inline card loader (unboxing animation) */
export function JNECardLoader({ message = 'Memuat...' }: { message?: string }) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const t = setInterval(() => setOpen(v => !v), 1200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <BoxSVG open={open} />
      <p className="text-[13px] font-medium text-slate-500">{message}</p>
    </div>
  );
}

/** Small inline spinner for buttons */
export function JNESpinner({ size = 18, color = '#E31E24' }: { size?: number; color?: string }) {
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </motion.svg>
  );
}
