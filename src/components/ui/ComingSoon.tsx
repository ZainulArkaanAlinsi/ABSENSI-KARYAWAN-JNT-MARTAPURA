'use client';

import { motion } from 'framer-motion';
import { Construction, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  features?: string[];
}

export default function ComingSoon({
  title,
  description,
  icon: Icon = Construction,
  features = [],
}: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md text-center"
      >
        {/* Icon orb */}
        <div className="relative mx-auto mb-7 w-24 h-24">
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-3xl blur-2xl"
            style={{ background: 'rgba(227,30,36,0.35)' }}
          />
          <div
            className="relative w-24 h-24 rounded-3xl flex items-center justify-center text-white shadow-xl"
            style={{
              background: 'linear-gradient(135deg, #E31E24, #A8151A)',
              boxShadow: '0 12px 30px -10px rgba(227,30,36,0.55)',
            }}
          >
            <Icon size={36} strokeWidth={2.2} />
          </div>
        </div>

        {/* Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[10px] font-black uppercase tracking-widest text-red-600 mb-4">
          <Sparkles size={11} />
          Segera Hadir
        </div>

        <h1 className="text-[26px] font-black text-slate-800 tracking-tight leading-tight">
          {title}
        </h1>
        <p className="text-[13px] font-medium text-slate-500 mt-3 leading-relaxed">{description}</p>

        {features.length > 0 && (
          <div className="mt-7 grid gap-2 text-left">
            {features.map((f, i) => (
              <motion.div
                key={f}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.06 }}
                className="flex items-start gap-3 p-3.5 bg-white rounded-2xl border border-slate-100"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              >
                <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[12px] font-black text-red-500">{i + 1}</span>
                </div>
                <p className="text-[12.5px] font-semibold text-slate-700 leading-relaxed">{f}</p>
              </motion.div>
            ))}
          </div>
        )}

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-8">
          JNE Martapura · Sistem Operasional
        </p>
      </motion.div>
    </div>
  );
}
