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
    <div 
      className="flex flex-col gap-1.5 rounded-2xl border px-4 py-3.5 transition-all group/badge"
      style={{ 
        background: 'var(--bg-input)', 
        borderColor: 'var(--border-primary)',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
      }}
    >
      <span className="text-[10px] font-black uppercase tracking-widest leading-none" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      <span className="text-[13px] font-black leading-tight tracking-tight" style={{ color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

export default function AttendancePage() {
  const router = useRouter();

  return (
    <div className="dash-root">
      {/* ── Info Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 overflow-hidden rounded-4xl border border-[#005596]/10"
        style={{ 
          background: 'linear-gradient(135deg, rgba(0, 85, 150, 0.05) 0%, rgba(227, 30, 36, 0.05) 100%)',
        }}
      >
        <div className="flex flex-col items-center gap-6 px-10 py-12 text-center md:flex-row md:text-left">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#005596] text-white shadow-xl shadow-[#005596]/20">
            <Info size={32} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-black italic uppercase tracking-tight text-slate-900">Pusat Kendali Unit</h2>
            <p className="mt-2 font-bold uppercase tracking-widest text-slate-400 text-[11px]">Konfigurasi jam kerja & parameter absensi khusus tiap unit kerja JNE Martapura.</p>
          </div>
        </div>
      </motion.div>

      {/* ── Grid Rules ── */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {DEPARTMENT_RULES.map((rule, idx) => (
          <motion.div
            key={rule.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="group relative overflow-hidden rounded-4xl border border-slate-100 bg-white p-10 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/50"
          >
            {/* Header Unit */}
            <div className="mb-10 flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div 
                  className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-transform group-hover:scale-110"
                  style={{ background: 'var(--primary)', color: 'white' }}
                >
                  <DeptIcon rule={rule} />
                </div>
                <div>
                  <h3 className="text-xl font-black italic uppercase tracking-tight text-slate-900">{rule.id}</h3>
                  <div className="mt-2 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-green-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">PARAMETER AKTIF</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid Badges */}
            <div className="grid grid-cols-2 gap-4">
              <RuleBadge label="Mulai Shift" value={rule.checkInTime} />
              <RuleBadge label="Selesai Shift" value={rule.checkOutTime} />
              <RuleBadge label="Toleransi" value={`${rule.toleranceMinutes} Menit`} />
              <RuleBadge label="Verifikasi" value={rule.trackFromHome ? 'Aplikasi Mobile' : 'Biometrik'} />
            </div>

            {/* Action */}
            <button 
              onClick={() => router.push(`/attendance/history?dept=${rule.id}`)}
              className="mt-10 flex w-full items-center justify-between rounded-2xl bg-slate-50 px-8 py-5 transition-all hover:bg-slate-900 hover:text-white"
            >
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">Lihat Riwayat Unit</span>
              <ChevronRight size={18} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
