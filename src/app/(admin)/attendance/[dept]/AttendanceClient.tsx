'use client';

import { useParams, useRouter } from 'next/navigation';
import { DEPARTMENT_RULES, fmtMinutes, calcEffectiveMinutes, timeValueToISO } from '@/lib/departmentRules';
import { safeFormatTime } from '@/utils/dateFormatters';
import { subscribeToTodayAttendance } from '@/lib/firestore';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, AlertTriangle, CheckCircle2, XCircle,
  ArrowLeft, Activity, ShieldCheck, Inbox,
} from 'lucide-react';
import type { AttendanceRecord } from '@/types';

// ─── Status chip ──────────────────────────────────────────────
const STATUS_CFG: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  present:  { label: 'Hadir',    dot: 'bg-emerald-400', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  late:     { label: 'Telat',    dot: 'bg-amber-400',   bg: 'bg-amber-50',   text: 'text-amber-700'   },
  absent:   { label: 'Absen',    dot: 'bg-red-400',     bg: 'bg-red-50',     text: 'text-red-600'     },
  leave:    { label: 'Izin',     dot: 'bg-slate-400',   bg: 'bg-slate-100',  text: 'text-slate-600'   },
  overtime: { label: 'Lembur',   dot: 'bg-violet-400',  bg: 'bg-violet-50',  text: 'text-violet-700'  },
  holiday:  { label: 'Libur',    dot: 'bg-slate-300',   bg: 'bg-slate-50',   text: 'text-slate-500'   },
};

function StatusChip({ status }: { status: string }) {
  const s = STATUS_CFG[status] ?? STATUS_CFG.absent;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ─── Skeleton rows ────────────────────────────────────────────
const SkeletonRow = ({ i }: { i: number }) => (
  <tr>
    <td colSpan={6} className="px-5 py-3.5">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: i * 0.05 }}
        className="h-9 bg-slate-100 rounded-xl animate-pulse"
      />
    </td>
  </tr>
);

export default function AttendanceClient() {
  const params  = useParams<{ dept: string }>();
  const router  = useRouter();
  const deptSlug = params?.dept ?? '';

  const rule = DEPARTMENT_RULES.find(r =>
    r.name.toLowerCase().replace(/[\s/()]+/g, '-') === deptSlug,
  );

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!rule) return;
    setLoading(true);
    const unsub = subscribeToTodayAttendance(todayStr, all => {
      setRecords(all.filter(r => r.department === rule.name));
      setLoading(false);
    });
    return () => unsub();
  }, [rule, todayStr]);

  // ── Not found ──
  if (!rule) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
          <XCircle size={28} className="text-red-500" />
        </div>
        <div>
          <p className="text-[15px] font-bold text-slate-700">Departemen Tidak Ditemukan</p>
          <p className="text-[12px] text-slate-400 mt-1">Sektor yang diminta tidak tersedia dalam sistem.</p>
        </div>
        <button
          onClick={() => router.push('/attendance')}
          className="flex items-center gap-2 h-10 px-5 rounded-xl text-[12px] font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#10B981,#059669)' }}
        >
          Kembali ke Absensi
        </button>
      </div>
    );
  }

  const totalPresent = records.filter(r => ['present', 'late'].includes(r.status)).length;
  const totalLate    = records.filter(r => r.status === 'late').length;
  const totalLeave   = records.filter(r => r.status === 'leave').length;
  const totalAbsent  = records.filter(r => r.status === 'absent').length;

  return (
    <div className="flex flex-col gap-5 pb-6">

      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/attendance')}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-300 transition-all shrink-0"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {format(new Date(), 'EEEE, dd MMMM yyyy', { locale: localeId })}
            </p>
            <h1 className="text-[22px] font-black text-slate-800 tracking-tight leading-none">
              {rule.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 h-9 px-4 bg-white border border-slate-200 rounded-xl text-[12px] font-semibold text-slate-600 hover:border-emerald-300 hover:text-emerald-600 transition-all"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            Ekspor Log
          </motion.button>
        </div>
      </motion.div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Personel Aktif',  val: totalPresent, icon: CheckCircle2, accent: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Terlambat',       val: totalLate,    icon: AlertTriangle, accent: 'text-amber-600',  bg: 'bg-amber-100'   },
          { label: 'Izin / Cuti',     val: totalLeave,   icon: Activity,     accent: 'text-sky-600',    bg: 'bg-sky-100'     },
          { label: 'Tidak Hadir',     val: totalAbsent,  icon: XCircle,      accent: 'text-red-500',    bg: 'bg-red-100'     },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 + i * 0.07 }}
            className="bg-white rounded-2xl px-4 py-3.5 border border-slate-100 flex items-center gap-3"
            style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
          >
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon size={16} className={s.accent} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
              <p className={`text-[22px] font-black leading-none tabular-nums ${s.accent}`}>
                {loading ? '—' : s.val}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── DEPT POLICY CARD ── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
        className="bg-white rounded-2xl border border-slate-100 p-5"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
      >
        <div className="flex flex-col xl:flex-row gap-5">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <ShieldCheck size={16} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-slate-800">Kebijakan Departemen</p>
                <p className="text-[11px] text-slate-400">Batasan operasional untuk unit ini</p>
              </div>
            </div>
            <p className="text-[12px] text-slate-500 leading-relaxed pl-12 max-w-2xl">{rule.description}</p>
          </div>

          <div className="flex flex-wrap gap-2 items-center pl-12 xl:pl-0">
            {[
              { icon: Clock,         label: 'Jam Masuk',  val: rule.checkInTime },
              { icon: Clock,         label: 'Jam Keluar', val: rule.checkOutNextDay ? `${rule.checkOutTime} (+1h)` : rule.checkOutTime },
              { icon: AlertTriangle, label: 'Toleransi',  val: `${rule.toleranceMinutes} menit` },
            ].map(item => (
              <div key={item.label} className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                <item.icon size={13} className="text-emerald-500 shrink-0" />
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">{item.label}</p>
                  <p className="text-[13px] font-black text-slate-800 leading-none">{item.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── TABLE ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
      >
        <div className="px-5 py-3.5 border-b border-slate-100">
          <p className="text-[13px] font-bold text-slate-700">
            Log Transaksi Langsung
            <span className="ml-2 text-[11px] text-slate-400 font-medium">({records.length} record)</span>
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Karyawan', 'Status', 'Masuk', 'Keluar', 'Selisih', 'Total Kerja'].map(h => (
                  <th key={h} className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} i={i} />)
                : records.length === 0
                  ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="py-16 flex flex-col items-center gap-2">
                          <motion.div
                            animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center"
                          >
                            <Inbox size={18} className="text-slate-300" />
                          </motion.div>
                          <p className="text-[12px] font-bold text-slate-500">Tidak ada sinyal terdeteksi hari ini</p>
                        </div>
                      </td>
                    </tr>
                  )
                  : (
                    <AnimatePresence>
                      {records.map((rec, idx) => {
                        let lateDisplay  = '—';
                        let yieldDisplay = '—';
                        if (rec.checkIn && rec.checkOut) {
                          const calc = calcEffectiveMinutes(rec.checkIn.time, rec.checkOut.time, rule);
                          if (calc.lateMinutes > 0) lateDisplay = fmtMinutes(calc.lateMinutes);
                          yieldDisplay = fmtMinutes(calc.effectiveMinutes);
                        }
                        return (
                          <motion.tr
                            key={rec.id}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.03 }}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-black shrink-0"
                                  style={{ background: `${rule.color}18`, color: rule.color }}
                                >
                                  {rec.employeeName?.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-desc font-bold text-slate-800 truncate">{rec.employeeName}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{rec.employeeId}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4"><StatusChip status={rec.status} /></td>
                            <td className="px-5 py-4 font-mono text-[13px] text-slate-600">
                              {safeFormatTime(rec.checkIn?.time, 'HH:mm:ss')}
                            </td>
                            <td className="px-5 py-4 font-mono text-[13px] text-slate-600">
                              {safeFormatTime(rec.checkOut?.time, 'HH:mm:ss')}
                            </td>
                            <td className="px-5 py-4 font-mono text-[13px] text-red-500">{lateDisplay}</td>
                            <td className="px-5 py-4 font-mono text-[13px] font-bold text-slate-700">{yieldDisplay}</td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  )
              }
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
