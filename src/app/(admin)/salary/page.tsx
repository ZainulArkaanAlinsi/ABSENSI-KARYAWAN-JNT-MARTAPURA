'use client';

import { motion } from 'framer-motion';
import { Banknote, Clock } from 'lucide-react';

export default function SalaryPage() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-20 h-20 rounded-3xl bg-emerald-100 flex items-center justify-center"
      >
        <Banknote size={36} className="text-emerald-500" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-[20px] font-black text-slate-800 tracking-tight">Payroll System</h1>
        <p className="text-[13px] text-slate-400 mt-2 font-medium max-w-xs mx-auto leading-relaxed">
          Fitur ini sedang dalam pengembangan dan akan segera tersedia.
        </p>
        <div className="flex items-center justify-center gap-2 mt-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <Clock size={13} />
          Segera Hadir
        </div>
      </motion.div>
    </div>
  );
}
