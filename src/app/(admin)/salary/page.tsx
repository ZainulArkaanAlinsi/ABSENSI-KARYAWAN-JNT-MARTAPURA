'use client';

import { motion } from 'framer-motion';
import { 
  Building2, 
  Banknote, 
  CreditCard, 
  Receipt, 
  Search, 
  Download,
  Activity,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

export default function SalaryPage() {
  return (
    <div className="dash-root max-w-[1400px] mx-auto">
      {/* ── HEADER ── */}
      <div className="mb-10 bg-(--bg-card) p-10 rounded-4xl border border-(--border-primary) shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-emerald-600/10 to-transparent pointer-events-none" />
        <div className="h-20 w-20 rounded-3xl bg-linear-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-xl shadow-emerald-900/20 relative z-10">
          <Banknote size={40} />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-black italic uppercase tracking-tight text-(--text-primary)">Kalkulasi Gaji & Insentif</h2>
          <p className="text-(--text-muted) font-bold uppercase tracking-widest text-[11px] mt-2">Perhitungan otomatis berdasarkan kehadiran, lembur, dan potongan disiplin.</p>
        </div>
      </div>

      {/* ── SUMMARY STATS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
         {[
           { label: 'Total Payroll', icon: CreditCard, color: 'emerald', value: 'IDR 0,00' },
           { label: 'Dana Cadangan', icon: Receipt, color: 'blue', value: 'IDR 0,00' },
           { label: 'Potongan Terlambat', icon: Activity, color: 'red', value: 'IDR 0,00' }
         ].map((stat, i) => (
           <motion.div 
             key={i}
             initial={{ opacity: 0, y: 15 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             className="bg-(--bg-card) p-8 rounded-3xl border border-(--border-primary) shadow-sm group hover:border-(--text-dim) transition-all"
           >
              <div className="flex items-center justify-between mb-4">
                 <div className={`h-10 w-10 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-500 flex items-center justify-center`}>
                    <stat.icon size={20} />
                 </div>
                 <ArrowUpRight size={14} className="text-(--text-dim) opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[10px] font-black text-(--text-muted) uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-(--text-primary) tracking-tight">{stat.value}</h3>
           </motion.div>
         ))}
      </div>

      {/* ── PLACEHOLDER TABLE ── */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-(--bg-card) rounded-4xl border border-(--border-primary) shadow-sm p-20 text-center relative overflow-hidden"
      >
         <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none" />
         <div className="relative z-10">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 text-(--text-dim) mb-6 border border-(--border-primary)">
               <Building2 size={40} />
            </div>
            <h4 className="text-lg font-black text-(--text-primary) uppercase italic mb-2">Modul Payroll Belum Aktif</h4>
            <p className="text-(--text-muted) font-bold uppercase tracking-widest text-[10px] max-w-sm mx-auto leading-relaxed mb-8">
               Sistem sedang dalam tahap integrasi data dengan JNE Pusat untuk kalkulasi otomatis dan rekonsiliasi bank.
            </p>
            <div className="flex justify-center gap-3">
               <button className="px-8 py-3 rounded-xl bg-white/5 border border-(--border-primary) text-[10px] font-black text-(--text-muted) uppercase tracking-widest hover:text-(--text-primary) transition-all">
                  Pelajari Lebih Lanjut
               </button>
               <button className="px-8 py-3 rounded-xl bg-[#005596] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#005596]/20">
                  <div className="flex items-center gap-2">
                     <ShieldCheck size={14} /> Sinkronisasi Manual
                  </div>
               </button>
            </div>
         </div>
      </motion.div>
    </div>
  );
}
