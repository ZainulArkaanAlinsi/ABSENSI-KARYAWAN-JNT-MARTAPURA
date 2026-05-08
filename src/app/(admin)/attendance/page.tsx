'use client';

import { DEPARTMENT_RULES } from '@/lib/departmentRules';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Clock,
  Target,
  Moon,
  Home,
  ChevronRight,
  Info,
  ShieldCheck,
  Activity,
  CalendarDays,
  FileText
} from 'lucide-react';

// Department icon mapping
function DeptIcon({ rule }: { rule: typeof DEPARTMENT_RULES[0] }) {
  if (rule.checkOutNextDay) return <Moon size={22} />;
  if (rule.trackFromHome)   return <Home size={22} />;
  if (rule.targetBased)     return <Target size={22} />;
  return <Clock size={22} />;
}

function RuleBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border border-(--border-color) bg-(--bg-main) px-4 py-3.5 transition-all group/badge">
      <span className="text-[10px] font-black uppercase tracking-widest leading-none text-(--text-secondary)">
        {label}
      </span>
      <span className="text-[13px] font-black leading-tight tracking-tight text-(--text-primary)">{value}</span>
    </div>
  );
}

export default function AttendancePage() {
  const router = useRouter();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-(--text-primary) tracking-tighter italic uppercase">
            Operational <span className="text-cyan-600">Nexus</span>
          </h1>
          <p className="text-(--text-secondary) font-bold text-xs uppercase tracking-[0.3em] mt-2 ml-1">Konfigurasi & Monitoring Absensi Unit</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/attendance/live')}
            className="h-12 px-8 bg-slate-950 dark:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-xl hover:bg-cyan-600 transition-all group"
          >
             <Activity size={18} className="group-hover:animate-pulse" />
             Live Monitor
          </button>
          <button 
            onClick={() => router.push('/attendance/leaves')}
            className="h-12 px-8 bg-cyan-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-xl shadow-cyan-600/20 hover:scale-105 transition-all"
          >
             <FileText size={18} />
             Leave Requests
          </button>
          <button 
            onClick={() => router.push('/attendance/history')}
            className="h-12 px-8 bg-(--bg-card) border border-(--border-color) text-(--text-primary) rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:border-cyan-600 transition-all"
          >
             <CalendarDays size={18} />
             Full Archive
          </button>
        </div>
      </div>

      {/* ── Info Banner (Zen Premium Style) ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[32px] border border-cyan-600/10 bg-cyan-600/5"
      >
        <div className="flex flex-col items-center gap-8 px-10 py-10 text-center md:flex-row md:text-left">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 dark:bg-slate-800 text-white shadow-2xl">
            <Info size={28} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-black italic uppercase tracking-tight text-(--text-primary)">Unit Protocol Control</h2>
            <p className="mt-2 font-bold uppercase tracking-widest text-(--text-secondary) text-[10px] leading-relaxed">
              Setiap unit kerja memiliki parameter absensi yang berbeda berdasarkan kebutuhan operasional di lapangan. 
              Gunakan panel di bawah untuk meninjau aturan atau melihat riwayat tiap unit.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Grid Rules ── */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {DEPARTMENT_RULES.map((rule, idx) => (
          <motion.div
            key={rule.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bento-card group flex flex-col h-full"
          >
            {/* Header Unit */}
            <div className="mb-8 flex items-start justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 dark:bg-slate-900 text-white shadow-lg transition-transform group-hover:scale-110 group-hover:bg-cyan-600">
                  <DeptIcon rule={rule} />
                </div>
                <div>
                  <h3 className="text-lg font-black italic uppercase tracking-tight text-(--text-primary)">{rule.id}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-(--text-secondary)">Parameter Aktif</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid Badges */}
            <div className="grid grid-cols-2 gap-3 flex-1 mb-8">
              <RuleBadge label="Mulai Shift" value={rule.checkInTime} />
              <RuleBadge label="Selesai Shift" value={rule.checkOutTime} />
              <RuleBadge label="Toleransi" value={`${rule.toleranceMinutes}m`} />
              <RuleBadge label="Verifikasi" value={rule.trackFromHome ? 'Mobile App' : 'Biometric'} />
            </div>

            {/* Action */}
            <button 
              onClick={() => router.push(`/attendance/history?dept=${rule.id}`)}
              className="flex items-center justify-between rounded-xl bg-(--bg-main) border border-(--border-color) px-6 py-4 transition-all hover:bg-cyan-600 hover:text-white group/btn"
            >
              <span className="text-[10px] font-black uppercase tracking-widest italic text-(--text-primary) group-hover:text-white">Review Unit Archive</span>
              <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
